import type {
  Challenge,
  PhishingEmail,
  DecoderPuzzle,
  ScamQuizQuestion,
  SocialEngineeringScenario,
  PrivacyPuzzleIssue,
  OsintChallenge,
  CaptchaChallengeData,
} from "./types";

export const CHALLENGE_DATA: Challenge[] = [
  {
    id: "password-master",
    title: "Moul Cyber",
    description: "Test your password creation skills against the clock.",
    instructions:
      "Your mission is to create 5 strong passwords (strength > 80) in 60 seconds. Each strong password earns you 20 points.",
  },
  {
    id: "phishing-detective",
    title: "Phishing Detective",
    description: "Can you spot the fake emails from the real ones?",
    instructions:
      'Analyze a series of emails and decide if they are "Safe" or a "Scam". You get +10 for a correct guess and -5 for an incorrect one.',
  },
  {
    id: "secret-message-decoder",
    title: "Secret Message Decoder",
    description: "Put on your detective hat and decode these ciphers.",
    instructions:
      "Solve 5 different cipher puzzles. You get 20 points for each correct solution. Using a hint will cost you 5 points.",
  },
  {
    id: "spot-the-scam",
    title: "Spot the Scam Quiz",
    description: "Real-world scenarios to test your scam awareness.",
    instructions:
      "Answer 15 multiple-choice questions about various real-world security scenarios. Your answers will determine your security personality.",
  },
  {
    id: "digital-footprint",
    title: "Digital Footprint Simulator",
    description: "See how your online choices impact your privacy.",
    instructions:
      "Navigate through a short story and make decisions. Your choices will affect your privacy and security scores, which determine your final points.",
  },
  {
    id: "osint-geoguessr",
    title: "Khedam fe Telecommunication",
    description: "Use image clues to find the location.",
    instructions:
      "Analyze the image for clues (OSINT) and find the location on the map. The closer you are, the more points you get.",
  },
  {
    id: "social-engineering",
    title: "Social Engineering Challenge",
    description: "Navigate tricky social situations and make the right call.",
    instructions:
      "Respond to 10 real-world social engineering scenarios. Your choices will determine your score.",
  },
  {
    id: "pacman-challenge",
    title: "Pacman",
    description: "PACMAN",
    instructions: "pacman instructions",
  },
  {
    id: "zip-lookup",
    title: "Fin mcha Hamid",
    description: "sift 2m l 90 90 o jawb 3la l2as2ila",
    instructions: `Kola Zip fih a password khasek tguesseh. Enjoy!!`,
  },
];

export const OSINT_CHALLENGES: OsintChallenge[] = [
  {
    id: "osint",
    imageUrl: "https://picsum.photos/seed/eiffel/600/400",
    coords: { lat: 48.8584, lng: 2.2945 },
    clues: [
      "Iconic lattice tower",
      "Located in Paris, France",
      "Champ de Mars",
    ],
    hint: "Eiffel Tower",
  },
  {
    id: "statue-of-liberty",
    imageUrl: "https://picsum.photos/seed/liberty/600/400",
    coords: { lat: 40.6892, lng: -74.0445 },
    clues: [
      "Copper statue on Liberty Island",
      "Gift from France",
      "Located in New York Harbor",
    ],
    hint: "Statue of Liberty",
  },
  {
    id: "sydney-opera-house",
    imageUrl: "https://picsum.photos/seed/sydney/600/400",
    coords: { lat: -33.8568, lng: 151.2153 },
    clues: [
      "Multi-venue performing arts centre",
      "Located in Sydney, Australia",
      "Famous for its shell-like roof design",
    ],
    hint: "Sydney Opera",
  },
];

export const CAPTCHA_CHALLENGES: CaptchaChallengeData[] = [
  {
    id: "simple-text",
    type: "text",
    prompt: "Enter the text as you see it:",
    image: "https://picsum.photos/seed/captcha1/200/70",
    solution: "smwm",
  },
  {
    id: "distorted",
    type: "text",
    prompt: "Enter the distorted text:",
    image: "https://picsum.photos/seed/captcha2/200/70",
    solution: "24WNB",
  },
  {
    id: "image-grid",
    type: "grid",
    prompt: "Select all squares with traffic lights",
    image: "https://picsum.photos/seed/captcha3/300/300",
    gridSize: 3,
    solutions: [1, 4, 7], // 0-indexed grid positions
    solution: [1, 4, 7], // Also add for type compatibility
  },
  {
    id: "slider",
    type: "slider",
    prompt: "Slide the puzzle piece to fit",
    image: "https://picsum.photos/seed/captcha4/300/200",
    piece: "https://picsum.photos/seed/captcha5/64/64",
    solution: 170, // a pixel value
  },
];

export const PHISHING_EMAILS: PhishingEmail[] = [
  {
    id: 1,
    sender: "support@yourbank-alerts.com",
    subject: "URGENT: Suspicious Activity on Your Account!",
    snippet:
      "We have detected unusual login attempts on your account. Please verify your identity immediately...",
    body: '<p>Dear Customer,</p><p>We have detected suspicious activity on your account. To protect your funds, we have temporarily suspended your account. Please click the link below to verify your identity and restore access.</p><p><a href="#" class="text-blue-600 underline">https://yourbank-alerts.com/verify-identity</a></p><p>Thank you,<br/>Your Bank Security Team</p>',
    type: "scam",
    explanation:
      "This is a phishing attempt. The urgent tone, generic greeting, and suspicious link are all red flags.",
    redFlags: ["Urgency", "Suspicious Link", "Generic Greeting"],
  },
  {
    id: 2,
    sender: "no-reply@university.edu",
    subject: "Weekly Campus Newsletter",
    snippet:
      "Find out what's happening on campus this week! Events, news, and more...",
    body: "<p>Hello Student,</p><p>Here is your weekly update on campus events, news, and important deadlines. Check out the new art exhibit at the gallery or sign up for the charity run.</p><p>For more details, visit the official campus portal.</p><p>Best,<br/>The Student Affairs Office</p>",
    type: "safe",
    explanation:
      "This is a legitimate email. It provides general information and directs you to an official, known website without asking for personal info.",
    redFlags: [],
  },
  {
    id: 3,
    sender: "winner@global-lottery.net",
    subject: "Congratulations! You have won $1,000,000!",
    snippet:
      "You have been selected as the grand prize winner in our international lottery. Claim your prize now!",
    body: "<p>DEAR LUCKY WINNER,</p><p>YOU HAVE BEEN RANDOMLY SELECTED TO RECEIVE A GRAND PRIZE OF $1,000,000! To claim your winnings, you must first pay a small processing fee of $250. Please send the fee via wire transfer to the account details below.</p><p>This is a once-in-a-lifetime opportunity!</p>",
    type: "scam",
    explanation:
      'This is a classic "too good to be true" scam. Legitimate lotteries do not ask for a fee to claim a prize.',
    redFlags: ["Too good to be true", "Request for money", "Urgency"],
  },
  // Add more emails to reach 10
  {
    id: 4,
    sender: "hr@corporate-co.com",
    subject: "Action Required: Update Your Payroll Information",
    snippet:
      "Your payroll information is out of date. Click here to update it to ensure you receive your next paycheck.",
    body: '<p>Dear Employee,</p><p>Our records indicate that your payroll information needs to be updated. Please click the link below and log in to our secure portal to make the necessary changes. Failure to do so may result in a delay in your next payment.</p><p><a href="#" class="text-blue-600 underline">http://payroll-update.corporate-co.biz</a></p><p>Thank you,<br/>HR Department</p>',
    type: "scam",
    explanation:
      "The suspicious domain (.biz instead of .com) and the urgent request to enter login credentials are major red flags for a phishing attempt.",
    redFlags: ["Suspicious Link", "Urgency", "Request for credentials"],
  },
  {
    id: 5,
    sender: "delivery-notice@fedex.com",
    subject: "Your package delivery from Amazon has been updated",
    snippet:
      "Your package with tracking number #1Z9999W99999999999 is scheduled for delivery tomorrow.",
    body: "<p>Hi,</p><p>Your package from Amazon is on its way. You can track its progress or manage your delivery options on our official website.</p><p>Tracking Number: 1Z9999W99999999999</p><p>Regards,<br/>FedEx</p>",
    type: "safe",
    explanation:
      "This is a standard, legitimate delivery notification. It comes from an official domain and does not ask for sensitive information.",
    redFlags: [],
  },
];

export const DECODER_PUZZLES: DecoderPuzzle[] = [
  {
    id: "caesar",
    name: "Caesar Cipher (Shift 3)",
    encrypted: "KHOOR ZRUOG",
    solution: "HELLO WORLD",
    hint: "Each letter is shifted forward by 3 places in the alphabet (A becomes D, B becomes E, etc.).",
  },
  {
    id: "reverse",
    name: "Reverse Text",
    encrypted: "drowssap terces",
    solution: "secret password",
    hint: "Read the message backwards.",
  },
  {
    id: "a1z26",
    name: "A1Z26 Cipher",
    encrypted: "8-5-12-12-15",
    solution: "hello",
    hint: "Each number corresponds to a letter's position in the alphabet (A=1, B=2, ...).",
  },
  {
    id: "morse",
    name: "Morse Code",
    encrypted: "... --- ...",
    solution: "sos",
    hint: "This is a famous distress signal. Use a Morse code chart to translate the dots and dashes.",
  },
  {
    id: "substitution",
    name: "Simple Substitution",
    encrypted: "GEXG UYI GEXG",
    solution: "TEST IS TEST",
    hint: "This is a substitution cipher where each letter is consistently replaced by another. Notice the repeated word pattern.",
  },
];

export const SCAM_QUIZ_QUESTIONS: ScamQuizQuestion[] = [
  {
    question:
      "Someone calls you, claiming to be from your bank's IT support. They say there's an issue with your account and ask for your password to fix it. What should you do?",
    options: [
      "Give them the password; they're trying to help.",
      "Hang up and call your bank using the official number on their website.",
      "Ask them to prove who they are by telling you your account balance.",
      "Tell them your password but change it right after.",
    ],
    answer:
      "Hang up and call your bank using the official number on their website.",
    explanation:
      "Never give your password to anyone over the phone. Legitimate organizations will never ask for it. Always verify by initiating the contact yourself through official channels.",
  },
  {
    question:
      "You find a USB drive in the university parking lot labeled 'Finals Answers'. What's the safest course of action?",
    options: [
      "Plug it into your personal laptop to see if the files are real.",
      "Plug it into a university computer to be safe.",
      "Give it to campus security or the lost and found.",
      "Wipe the drive and keep it for yourself.",
    ],
    answer: "Give it to campus security or the lost and found.",
    explanation:
      "This is a classic 'baiting' technique. The drive could contain malware that infects your computer as soon as you plug it in. Never plug in unknown USB drives.",
  },
  {
    question:
      "You receive an email from your favorite online store with a link for a 90% off flash sale. The link looks like 'www.amaz0n.dealz.com'. What's the biggest red flag?",
    options: [
      "The discount is too good to be true.",
      "The domain name is slightly altered ('amaz0n' with a zero and a '.dealz.com' ending).",
      "The email wasn't personalized with your name.",
      "The sale is for a limited time.",
    ],
    answer:
      "The domain name is slightly altered ('amaz0n' with a zero and a '.dealz.com' ending).",
    explanation:
      "Typosquatting, or using slightly altered domain names, is a common trick to make a fake website look legitimate. Always check the URL carefully.",
  },
  {
    question:
      "A friend's social media account, which they haven't used in months, suddenly sends you a message: 'OMG is this you in this video?? [suspicious link]'. What should you do?",
    options: [
      "Click the link to see the video.",
      "Reply and ask them if they really sent it.",
      "Ignore the message; it's probably spam.",
      "Contact your friend through a different method (like a text message) to verify.",
    ],
    answer:
      "Contact your friend through a different method (like a text message) to verify.",
    explanation:
      "The account has likely been compromised. The message uses a common tactic to trick you into clicking a malicious link. Verify with your friend out-of-band (not on the compromised platform).",
  },
  // Add more questions to reach 15
  {
    question: "What is 'phishing'?",
    options: [
      "A type of computer virus.",
      "A method of catching fish using technology.",
      "An attempt to trick someone into revealing sensitive information.",
      "A secure way to store passwords.",
    ],
    answer: "An attempt to trick someone into revealing sensitive information.",
    explanation:
      "Phishing uses deceptive emails, messages, or websites to steal personal information like passwords and credit card numbers.",
  },
];

export const SOCIAL_ENGINEERING_SCENARIOS: SocialEngineeringScenario[] = [
  {
    scenario:
      "Someone follows you into a secure university building, saying, 'I forgot my ID badge, can you let me in?'",
    type: "Tailgating",
    options: [
      {
        text: "Hold the door open for them.",
        isCorrect: false,
        explanation:
          "This is tailgating. You could be letting an unauthorized person into a secure area.",
      },
      {
        text: "Apologize and say you can't, directing them to the main entrance/reception.",
        isCorrect: true,
        explanation:
          "Correct. Always follow security policy and never let someone piggyback on your access.",
      },
    ],
  },
  {
    scenario:
      "You receive an email with a PDF attachment named 'Updated_Company_Holiday_Schedule.pdf' from an unknown sender.",
    type: "Baiting",
    options: [
      {
        text: "Open the PDF to see the new schedule.",
        isCorrect: false,
        explanation:
          "The attachment could contain malware. Never open unexpected attachments from unknown senders.",
      },
      {
        text: "Delete the email without opening the attachment.",
        isCorrect: true,
        explanation:
          "This is the safest action. If you were expecting a schedule, verify with the source through official channels.",
      },
    ],
  },
  {
    scenario:
      "A person in a convincing uniform asks for your password to 'fix a network issue on your computer'.",
    type: "Pretexting",
    options: [
      {
        text: "Give them the password; they look official.",
        isCorrect: false,
        explanation:
          "Never share your password. Legitimate IT staff have other ways to access systems and will not ask for your password.",
      },
      {
        text: "Refuse and offer to call the official IT helpdesk to verify their request.",
        isCorrect: true,
        explanation:
          "Correct. Always verify such requests through official channels. The uniform could be fake.",
      },
    ],
  },
  // Add more to reach 10
  {
    scenario:
      "An online 'friend' you've never met asks for $50, promising to pay you back double next week.",
    type: "Quid Pro Quo",
    options: [
      {
        text: "Send them the money; it's a small amount to help a friend.",
        isCorrect: false,
        explanation:
          "This is likely a scam. Be wary of anyone asking for money online, especially with promises of a larger return.",
      },
      {
        text: "Politely decline the request.",
        isCorrect: true,
        explanation:
          "Correct. It's important to protect your finances and be skeptical of requests for money from online acquaintances.",
      },
    ],
  },
];

export const PRIVACY_PUZZLE_ISSUES: PrivacyPuzzleIssue[] = [
  {
    id: "location",
    uiText: "Location Sharing: Enabled for all posts",
    explanation:
      "Disabling automatic location tagging prevents others from tracking your movements.",
    area: "posts",
  },
  {
    id: "profile-public",
    uiText: "Profile Visibility: Public",
    explanation:
      "Setting your profile to private ensures only approved followers can see your content.",
    area: "profile",
  },
  {
    id: "email-visible",
    uiText: "Email Visibility: Everyone",
    explanation:
      "Hiding your email address reduces spam and phishing attempts.",
    area: "contact",
  },
  {
    id: "tag-approval",
    uiText: "Tag Review: Off",
    explanation:
      "Enabling tag review lets you approve photos you're tagged in before they appear on your profile.",
    area: "tags",
  },
  {
    id: "friend-list",
    uiText: "Friend List: Visible to Everyone",
    explanation:
      "Hiding your friend list can prevent scammers from targeting your connections.",
    area: "friends",
  },
  {
    id: "search-indexing",
    uiText: "Search Engine Indexing: On",
    explanation:
      "Turning this off prevents your profile from appearing in external search engine results.",
    area: "search",
  },
  {
    id: "data-sharing",
    uiText: "Third-Party App Access: All apps",
    explanation:
      "Regularly review and remove unnecessary third-party app permissions to limit data sharing.",
    area: "apps",
  },
  {
    id: "face-recognition",
    uiText: "Face Recognition: On",
    explanation:
      "Disabling face recognition can prevent the platform from automatically identifying you in photos.",
    area: "photos",
  },
  {
    id: "activity-status",
    uiText: "Activity Status: On",
    explanation:
      "Turning off your activity status prevents others from seeing when you are online.",
    area: "chat",
  },
  {
    id: "contact-sync",
    uiText: "Contact Syncing: Enabled",
    explanation:
      "Disabling contact syncing stops the app from continuously uploading your phone's address book.",
    area: "contacts",
  },
];
