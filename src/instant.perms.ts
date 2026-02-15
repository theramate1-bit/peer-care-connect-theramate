// Simple permissions for MVP - allow all operations
const rules = {
  videos: {
    allow: {
      view: "true",
      create: "true", 
      update: "true",
      delete: "true",
    },
  },
};

export default rules;