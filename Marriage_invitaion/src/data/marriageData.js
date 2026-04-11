// src/data/marriageData.js

const marriageData = {
  invitationType: "Marriage",
  brideName: "Bride?",
  groomName: "Groom?",
  brideImage: null, // Place bride image at /public/images/bride.jpg
  groomImage: null, // Place groom image at /public/images/groom.jpg
  coupleImage: null, // Place couple image at /public/images/couple.jpg
  parents: {
    brideParents: "Mr. & Mrs. brideParents",
    groomParents: "Mr. & Mrs. groomParents",
  },
  story: [
    {
      title: "First Meet",
      description: "They first crossed paths at a college cultural fest in Bhubaneswar — a chance encounter that neither would ever forget.",
      year: "2019",
      icon: "✨",
    },
    {
      title: "Becoming Friends",
      description: "Long conversations over chai turned into the most beautiful friendship, filling every ordinary day with extraordinary memories.",
      year: "2020",
      icon: "☕",
    },
    {
      title: "Falling in Love",
      description: "What began as friendship slowly blossomed into a love story written in stolen glances and whispered confessions.",
      year: "2021",
      icon: "💕",
    },
    {
      title: "The Proposal",
      description: "Under a sky painted gold at sunset on Puri beach, Rahul got down on one knee and asked the question of a lifetime.",
      year: "2023",
      icon: "💍",
    },
    {
      title: "Engagement",
      description: "Surrounded by family and flowers, they exchanged rings and promised forever — beginning a new chapter together.",
      year: "2024",
      icon: "💞",
    },
    {
      title: "Wedding",
      description: "Now they invite you to witness the most beautiful chapter — their wedding, where two souls unite as one.",
      year: "2026",
      icon: "👑",
    },
  ],
  events: [
    {
      name: "Haldi Ceremony",
      date: "10 December 2026",
      time: "9:00 AM",
      venue: "Sharma Residence",
      address: "Plot 42, Saheed Nagar, Bhubaneswar",
      icon: "🌼",
      color: "#f5c518",
    },
    {
      name: "Mehendi Night",
      date: "10 December 2026",
      time: "6:00 PM",
      venue: "Sharma Residence",
      address: "Plot 42, Saheed Nagar, Bhubaneswar",
      icon: "🌿",
      color: "#3a9e5f",
    },
    {
      name: "Sangeet Evening",
      date: "11 December 2026",
      time: "7:00 PM",
      venue: "Crystal Ballroom",
      address: "Mayfair Lagoon, Bhubaneswar",
      icon: "🎵",
      color: "#9b59b6",
    },
    {
      name: "Baraat & Jaimala",
      date: "12 December 2026",
      time: "5:00 PM",
      venue: "Royal Palace Lawn",
      address: "Jaydev Vihar, Bhubaneswar",
      icon: "🐎",
      color: "#e74c3c",
    },
    {
      name: "Wedding Ceremony",
      date: "12 December 2026",
      time: "7:00 PM",
      venue: "Royal Palace Banquet",
      address: "Jaydev Vihar, Bhubaneswar",
      icon: "💒",
      color: "#d4af37",
    },
    {
      name: "Wedding Reception",
      date: "13 December 2026",
      time: "6:00 PM",
      venue: "Royal Palace Garden",
      address: "Jaydev Vihar, Bhubaneswar",
      icon: "🥂",
      color: "#c0392b",
    },
  ],
  eventDate: "2026-12-12T19:00:00",
  venue: {
    name: "Royal Palace Banquet",
    address: "Jaydev Vihar, Bhubaneswar, Odisha 751013",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3742.5!2d85.8245!3d20.2961!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDE3JzQ2LjAiTiA4NcKwNDknMjguMiJF!5e0!3m2!1sen!2sin!4v1234567890",
    mapLink: "https://maps.google.com/?q=20.2961,85.8245",
    latitude: 20.2961,
    longitude: 85.8245,
  },
  rsvp: {
    contact: "7995987744",
    whatsapp: "9437637735",
    email: "dheerajchandan@gmail.com",
  },
  gallery: [
    // Place images at /public/images/gallery1.jpg through gallery8.jpg
    "/images/gallery1.jpg",
    "/images/gallery2.jpg",
    "/images/gallery3.jpg",
    "/images/gallery4.jpg",
    "/images/gallery5.jpg",
    "/images/gallery6.jpg",
    "/images/gallery7.jpg",
    "/images/gallery8.jpg",
  ],
  // backgroundMusic: "../assets/bgaudio/marriage-theme.mp3",
  backgroundMusic: new URL('../assets/bgaudio/marriage-theme.mp3', import.meta.url).href,
  themeColor: "#d4af37",
  themeSecondary: "#8B0000",
  themeTertiary: "#fdf0f5",
  dressCode: "Ethnic & Traditional",
};

export default marriageData;