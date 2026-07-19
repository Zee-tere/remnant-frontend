export const intentPages = {
  sell: {
    path: "/sell",
    intentTag: "SELL",
    title: "Sell Single Items & Used Goods in Nigeria",
    description:
      "Sell single items, second-hand goods, spare parts, incomplete sets, and everyday pre-owned products directly to buyers across Nigeria.",
    heading: "Sell single items and used goods in Nigeria",
    intro:
      "List the useful things ordinary marketplaces overlook, from one shoe or a spare remote to furniture, electronics, clothing, and household items.",
    actionLabel: "List an item for sale",
    listingsLabel: "Items for sale",
  },
  trade: {
    path: "/trade",
    intentTag: "TRADE",
    title: "Trade by Barter in Nigeria",
    description:
      "Trade items by barter with people across Nigeria. List what you have, say what you need, and find a practical exchange nearby.",
    heading: "Trade by barter in Nigeria",
    intro:
      "Exchange something useful for something you need. Remnant makes the offer, location, and expected trade clear before you start a conversation.",
    actionLabel: "List an item to trade",
    listingsLabel: "Items available for trade",
  },
  donate: {
    path: "/donate",
    intentTag: "DONATE",
    title: "Donate Useful Items in Nigeria",
    description:
      "Donate clothing, household goods, electronics, furniture, spare parts, and other useful items directly to people who can use them in Nigeria.",
    heading: "Donate useful items in Nigeria",
    intro:
      "Give useful belongings a direct route to another person. Add the item, choose your state, and agree on a safe collection or delivery plan.",
    actionLabel: "List an item to donate",
    listingsLabel: "Items available free",
  },
  repair: {
    path: "/repair",
    intentTag: "FIX",
    title: "Repair Broken Items & Find Useful Parts in Nigeria",
    description:
      "List repairable items or find broken electronics, appliances, furniture, and useful spare parts for repair projects across Nigeria.",
    heading: "Repair broken items and find useful parts",
    intro:
      "A damaged item may still be repairable or contain exactly the part someone needs. Make its condition clear and connect directly.",
    actionLabel: "List a repairable item",
    listingsLabel: "Items ready for repair",
  },
  recycle: {
    path: "/recycle",
    intentTag: "RECYCLE",
    title: "Recycle Old Items & Useful Materials in Nigeria",
    description:
      "List old electronics, damaged goods, recyclable parts, and reusable materials so recyclers and makers in Nigeria can find them.",
    heading: "Recycle old items and useful materials",
    intro:
      "When an item cannot be reused as it is, its parts and materials may still have value. List it clearly for recyclers, makers, and repairers.",
    actionLabel: "List an item to recycle",
    listingsLabel: "Items available for recycling",
  },
} as const;

export type IntentPageKey = keyof typeof intentPages;
