// Quote system for different scenarios and pages

export const quotes = {
  // First time visitor
  firstVisit: [
    "Hi there, welcome to my world",
    "Hello, step into my digital universe",
    "Hey there, ready to explore together?"
  ],
  
  // Returning visitor (refresh)
  returning: [
    "Welcome back, let's create magic",
    "Hey again, missed you!",
    "Back for more? I like that",
    "Ready to dive deeper?",
    "Let's pick up where we left off",
    "Welcome back to the adventure"
  ],
  
  // Page-specific quotes
  pages: {
    home: [
      "Home is where innovation begins",
      "Welcome to the creative hub",
      "This is where it all starts"
    ],
    about: [
      "What do you wanna know?",
      "What do you wanna know?",
      "What do you wanna know?"
    ],
    projects: [
      "Let's explore my creations",
      "Time to showcase some magic",
      "Ready to see what I've built?"
    ],
    contact: [
      "Let's start a conversation",
      "Ready to make something together?",
      "Your ideas + my skills = magic"
    ]
  }
}

export const getQuote = (pageName = 'home') => {
  const visitCount = localStorage.getItem('omar-visit-count') || '0'
  const lastVisit = localStorage.getItem('omar-last-visit')
  const today = new Date().toDateString()
  
  // Update visit count
  const currentCount = parseInt(visitCount) + 1
  localStorage.setItem('omar-visit-count', currentCount.toString())
  localStorage.setItem('omar-last-visit', today)
  
  // Special case for about page - always return the same quote
  if (pageName === 'about') {
    return "What do you wanna know?"
  }
  
  let quoteArray
  
  // First time visitor
  if (currentCount === 1) {
    quoteArray = quotes.firstVisit
  }
  // Returning visitor on same day
  else if (lastVisit === today) {
    quoteArray = quotes.returning
  }
  // Page-specific quotes for subsequent visits
  else {
    quoteArray = quotes.pages[pageName] || quotes.pages.home
  }
  
  // Get a random quote from the selected array
  const randomIndex = Math.floor(Math.random() * quoteArray.length)
  return quoteArray[randomIndex]
}

export const getQuoteForPage = (pageName) => {
  const pageQuotes = quotes.pages[pageName] || quotes.pages.home
  const randomIndex = Math.floor(Math.random() * pageQuotes.length)
  return pageQuotes[randomIndex]
}

// Reset visit count (for testing purposes)
export const resetVisitCount = () => {
  localStorage.removeItem('omar-visit-count')
  localStorage.removeItem('omar-last-visit')
}
