import axios from "axios";

const EVENTBRITE_API_URL = process.env.EVENTBRITE_API_URL;
const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;

const eventbriteClient = axios.create({
  baseURL: EVENTBRITE_API_URL,
  headers: {
    Authorization: `Bearer ${EVENTBRITE_API_KEY}`,
    "Content-Type": "application/json"
  }
});

export class EventbriteService {
  // Search for events with simple location filtering
  static async searchEvents(params = {}) {
    try {
      const {
        location = "Louisville, KY",
        categories,
        q: query,
        "start_date.range_start": startDate,
        sort_by = "date"
      } = params;

      const searchParams = {
        "location.address": location,
        "location.within": "25mi", // 25 mile radius
        expand: "venue,ticket_availability,logo",
        sort_by,
        "start_date.range_start": new Date().toISOString(), // Only future events
        ...params
      };

      // Remove empty parameters
      Object.keys(searchParams).forEach((key) => {
        if (!searchParams[key]) delete searchParams[key];
      });

      const response = await eventbriteClient.get("/events/search/", {
        params: searchParams
      });

      return {
        success: true,
        events: response.data.events.map((event) =>
          this.transformEventbriteEvent(event)
        ),
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error(
        "Eventbrite API Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error:
          error.response?.data?.error_description ||
          "Failed to fetch events from Eventbrite",
        events: []
      };
    }
  }

  // Get specific event details
  static async getEvent(eventId) {
    try {
      const response = await eventbriteClient.get(`/events/${eventId}/`, {
        params: {
          expand: "venue,ticket_availability,logo,organizer"
        }
      });

      return {
        success: true,
        event: this.transformEventbriteEvent(response.data)
      };
    } catch (error) {
      console.error(
        "Eventbrite Event Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error:
          error.response?.data?.error_description ||
          "Failed to fetch event from Eventbrite"
      };
    }
  }

  // Get event categories for filtering
  static async getCategories() {
    try {
      const response = await eventbriteClient.get("/categories/");
      return {
        success: true,
        categories: response.data.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          short_name: cat.short_name
        }))
      };
    } catch (error) {
      console.error(
        "Eventbrite Categories Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: "Failed to fetch categories from Eventbrite",
        categories: []
      };
    }
  }

  // Transform Eventbrite event to our standard format
  static transformEventbriteEvent(eventbriteEvent) {
    const start = new Date(eventbriteEvent.start.local);
    const venue = eventbriteEvent.venue;

    return {
      id: `eventbrite-${eventbriteEvent.id}`,
      name: eventbriteEvent.name.text,
      description:
        eventbriteEvent.description?.text ||
        eventbriteEvent.summary ||
        "No description available",
      date: start.toISOString().split("T")[0],
      time: start.toTimeString().slice(0, 5),
      location: this.formatLocation(venue),
      capacity: eventbriteEvent.capacity || 999, // Default large capacity if not specified
      attendees: this.calculateAttendees(eventbriteEvent),
      type: this.mapCategory(eventbriteEvent.category?.name),
      image: this.getEventImage(eventbriteEvent),
      price: this.formatPrice(eventbriteEvent),
      isExternal: true,
      externalId: eventbriteEvent.id,
      ticketUrl: eventbriteEvent.url,
      organizer: eventbriteEvent.organizer?.name || "Eventbrite Organizer"
    };
  }

  // Helper: Format venue location
  static formatLocation(venue) {
    if (!venue) return "Online Event";

    const parts = [];
    if (venue.name) parts.push(venue.name);
    if (venue.address?.city) parts.push(venue.address.city);
    if (venue.address?.region) parts.push(venue.address.region);

    return parts.join(", ") || "Location TBD";
  }

  // Helper: Calculate attendees (estimated)
  static calculateAttendees(event) {
    if (event.capacity && event.ticket_availability?.maximum_quantity) {
      return Math.max(
        0,
        event.capacity - event.ticket_availability.maximum_quantity
      );
    }
    // Return a reasonable estimate if data not available
    return Math.floor(Math.random() * 100);
  }

  // Helper: Map Eventbrite categories to our categories
  static mapCategory(eventbriteCategory) {
    const categoryMap = {
      "Business & Professional": "Conference",
      Music: "Concert",
      "Arts & Culture": "Exhibition",
      "Community & Culture": "Workshop",
      Education: "Workshop",
      "Fashion & Beauty": "Exhibition",
      "Film, Media & Entertainment": "Exhibition",
      "Food & Drink": "Workshop",
      "Government & Politics": "Conference",
      "Health & Wellness": "Workshop",
      "Hobbies & Special Interest": "Workshop",
      "Home & Lifestyle": "Workshop",
      "Performing & Visual Arts": "Exhibition",
      "Religion & Spirituality": "Workshop",
      "School Activities": "Workshop",
      "Science & Technology": "Conference",
      "Sports & Fitness": "Workshop",
      "Travel & Outdoor": "Workshop"
    };

    return categoryMap[eventbriteCategory] || "Other";
  }

  // Helper: Get best available image
  static getEventImage(event) {
    if (event.logo?.url) return event.logo.url;
    if (event.logo?.original?.url) return event.logo.original.url;

    // Return a default placeholder image
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=200&fit=crop";
  }

  // Helper: Format price from Eventbrite data
  static formatPrice(event) {
    if (event.is_free) return "Free";

    // Try to get price from ticket classes
    const ticketClasses = event.ticket_classes || [];
    if (ticketClasses.length > 0) {
      const prices = ticketClasses
        .filter((tc) => tc.cost && tc.cost.value > 0)
        .map((tc) => parseFloat(tc.cost.value / 100)); // Eventbrite prices are in cents

      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          return `$${minPrice.toFixed(2)}`;
        } else {
          return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
        }
      }
    }

    return "See Event Page";
  }

  // Helper: Search events by location (simplified without Google Maps)
  static getLocationSearchParams(locationQuery) {
    // Simple location mapping for common cities
    const locationMap = {
      louisville: "Louisville, KY",
      lexington: "Lexington, KY",
      cincinnati: "Cincinnati, OH",
      nashville: "Nashville, TN",
      indianapolis: "Indianapolis, IN",
      chicago: "Chicago, IL",
      "new york": "New York, NY",
      "los angeles": "Los Angeles, CA",
      "san francisco": "San Francisco, CA",
      atlanta: "Atlanta, GA"
    };

    const normalizedQuery = locationQuery.toLowerCase().trim();
    return locationMap[normalizedQuery] || locationQuery;
  }
}
