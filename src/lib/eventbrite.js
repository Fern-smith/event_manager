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
  static async searchEvents(params = {}) {
    try {
      const {
        location = "Louisville, KY",
        q: query,
        "start_date.range_start": startDate,
        sort_by = "date"
      } = params;

      const searchParams = {
        "location.address": location,
        "location.within": "25mi",
        expand: "venue,ticket_availability,logo",
        sort_by,
        "start_date.range_start": new Date().toISOString(),
        ...params
      };

      const response = await eventbriteClient.get("/events/search/", {
        params: searchParams
      });

      return {
        success: true,
        events: response.data.events.map((event) => this.transformEvent(event))
      };
    } catch (error) {
      console.error(
        "Eventbrite API Error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: "Failed to fetch Eventbrite events",
        events: []
      };
    }
  }

  static transformEvent(eventbriteEvent) {
    const start = new Date(eventbriteEvent.start.local);
    const venue = eventbriteEvent.venue;

    return {
      id: `eventbrite-${eventbriteEvent.id}`,
      name: eventbriteEvent.name.text,
      description:
        eventbriteEvent.description?.text || eventbriteEvent.summary || "",
      date: start.toISOString().split("T")[0],
      time: start.toTimeString().slice(0, 5),
      location: venue
        ? `${venue.name}, ${venue.address.city}, ${venue.address.region}`
        : "Online Event",
      capacity: eventbriteEvent.capacity || 999,
      attendees: this.calculateAttendees(eventbriteEvent),
      type: this.mapCategory(eventbriteEvent.category?.name),
      image:
        eventbriteEvent.logo?.url ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400",
      price: this.formatPrice(eventbriteEvent),
      isExternal: true,
      externalId: eventbriteEvent.id,
      ticketUrl: eventbriteEvent.url,
      organizer: eventbriteEvent.organizer?.name || "Eventbrite Organizer"
    };
  }

  static calculateAttendees(event) {
    if (event.capacity && event.ticket_availability?.maximum_quantity) {
      return Math.max(
        0,
        event.capacity - event.ticket_availability.maximum_quantity
      );
    }
    return Math.floor(Math.random() * 100);
  }

  static mapCategory(eventbriteCategory) {
    const categoryMap = {
      "Business & Professional": "Conference",
      Music: "Concert",
      "Arts & Culture": "Exhibition",
      "Community & Culture": "Workshop",
      Education: "Workshop",
      "Science & Technology": "Conference"
    };
    return categoryMap[eventbriteCategory] || "Other";
  }

  static formatPrice(event) {
    if (event.is_free) return "Free";

    const ticketClasses = event.ticket_classes || [];
    if (ticketClasses.length > 0) {
      const prices = ticketClasses
        .filter((tc) => tc.cost && tc.cost.value > 0)
        .map((tc) => parseFloat(tc.cost.value / 100));

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
}
