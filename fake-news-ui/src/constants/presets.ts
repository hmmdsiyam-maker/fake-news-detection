export interface NewsSample {
  title: string;
  text: string;
  category?: string;
}

export const REAL_SAMPLES: NewsSample[] = [
  {
    title: "US Senate passes bipartisan funding bill to prevent government shutdown",
    text: "WASHINGTON (Reuters) - The United States Senate overwhelmingly approved a bipartisan funding package on Thursday, sending the legislation to the president for signing into law. The measure funds key government agencies through the remainder of the fiscal year, avoiding a disruptive partial shutdown of federal operations across the country. Lawmakers from both parties praised the compromise following weeks of negotiations.",
    category: "Politics"
  },
  {
    title: "European Central Bank cuts interest rates by 25 basis points amid falling inflation",
    text: "FRANKFURT (AP) - The European Central Bank lowered its key deposit rate by a quarter point to 3.50% on Thursday, noting continued deceleration in underlying inflation across the 20-nation euro currency bloc. ECB President Christine Lagarde stated in a press briefing that incoming economic indicators confirmed the ongoing disinflationary path, while domestic wage pressures continue to moderate steadily.",
    category: "Economy"
  },
  {
    title: "NASA's James Webb Space Telescope detects carbon-bearing molecules in exoplanet atmosphere",
    text: "WASHINGTON (NASA Newsroom) - Astronomers analyzing spectroscopic data from NASA's James Webb Space Telescope announced the definitive detection of methane and carbon dioxide in the atmosphere of habitable-zone exoplanet K2-18 b. The discovery strengthens scientific models suggesting an atmosphere enriched with volatile compounds and possibly an ocean-covered planetary surface.",
    category: "Science"
  },
  {
    title: "Global renewable energy capacity expanded by record 50% in 2023, reports IEA",
    text: "PARIS (Reuters) - Renewable electricity additions grew by nearly 50% to roughly 510 gigawatts globally in 2023, marking the fastest growth rate in two decades according to the International Energy Agency. Solar photovoltaic installations accounted for three-quarters of the worldwide expansion, driven by policy incentives and manufacturing cost reductions across major international markets.",
    category: "Energy"
  },
  {
    title: "Federal Reserve maintains benchmark interest rate target range between 5.25% and 5.50%",
    text: "WASHINGTON (Bloomberg) - Federal Reserve officials unanimously voted to keep the benchmark lending rate unchanged at their two-day monetary policy meeting, citing sustained labor market strength and lingering inflation above the central bank's annual 2 percent target. Chair Jerome Powell underscored that future policy adjustments will strictly depend on incoming economic data.",
    category: "Finance"
  },
  {
    title: "World Health Organization certifies Egypt free of malaria after century-long campaign",
    text: "GENEVA (WHO Statement) - The World Health Organization officially declared Egypt free of malaria, describing the milestone as the culmination of an eradication effort spanning nearly a century. With over 100 million residents, Egypt represents the most populous nation in the Eastern Mediterranean region to receive this official epidemiological certification.",
    category: "Health"
  },
  {
    title: "Tokyo Electric Power completes planned treated wastewater release phase at Fukushima",
    text: "TOKYO (Kyodo News) - Tokyo Electric Power Company confirmed the successful completion of its scheduled release of treated water from the Fukushima Daiichi nuclear facility into the Pacific Ocean. Ongoing third-party monitoring conducted by the International Atomic Energy Agency verified that tritium levels in surrounding seawater remained well within international safety standards.",
    category: "Environment"
  },
  {
    title: "Automakers commit $30 billion to joint North American electric vehicle charging network",
    text: "DETROIT (Wall Street Journal) - A consortium of seven major global automakers announced substantial capital deployment toward installing 30,000 high-power fast-charging connectors along major urban corridors and highway systems in North America. The initiative aims to standardize vehicle charging infrastructure across commercial transit corridors.",
    category: "Technology"
  }
];

export const FAKE_SAMPLES: NewsSample[] = [
  {
    title: "Secret subterranean alien military base discovered beneath Antarctic ice shelf",
    text: "A rogue whistleblower from an unnamed clandestine intelligence agency has revealed unredacted satellite blueprints allegedly confirming a subterranean extraterrestrial research laboratory hidden beneath deep Antarctic glaciers for over seven decades, completely kept secret from world leaders who have secretly signed technology transfer pacts.",
    category: "Conspiracy"
  },
  {
    title: "Miracle herbal seed completely cures stage-four cancer in 48 hours, Big Pharma bans sale",
    text: "A renegade biologist operating outside mainstream academic circles has uncovered an ancient Himalayan forest seed that completely incinerates all malignant tumors within two days without radiation. Pharmaceutical conglomerates and federal agencies allegedly coordinated an immediate nationwide raid on all research facilities to suppress the free cure.",
    category: "Medical Hoax"
  },
  {
    title: "World Economic Forum mandates mandatory under-skin microchips for all grocery purchases by 2026",
    text: "Leaked secret conference memos from Davos indicate that a coalition of global banking elites will enact an emergency decree requiring all citizens to receive RFID transponder implants in their right wrists to buy food or fuel. The underground system will allegedly freeze financial access if carbon credit quotas are exceeded.",
    category: "Conspiracy"
  },
  {
    title: "Shocking leaked audio reveals moon landing was staged on secret military soundstage in Nevada",
    text: "Newly leaked magnetic tape archives purported to originate from a decommissioned underground bunker in Area 51 allegedly capture Hollywood film directors laughing while instructing astronauts on how to simulate zero-gravity hops. Mainstream historians have scrambled to silence the viral recording.",
    category: "Historic Hoax"
  },
  {
    title: "5G cellular towers secretly transmit mind-control frequency waves, whistleblower exposes",
    text: "An anonymous telecommunications engineer has published classified frequency schematics proving that standard cellular broadcast arrays emit low-frequency magnetic resonance designed to alter cerebral dopamine levels and compel citizens to obey governmental lockdowns and retail spending directives.",
    category: "Pseudoscience"
  },
  {
    title: "Central banks preparing to freeze all private personal bank accounts overnight in secret reset",
    text: "Urgent emergency warnings circulating among unvetted financial channels claim that major international central banks will suspend all ATM withdrawals and debit card transactions this upcoming weekend. Citizens are frantically urged to convert savings into unregulated digital tokens before the irreversible global wealth wipeout.",
    category: "Financial Panic"
  },
  {
    title: "Ancient electromagnetic power pyramid uncovered on Mars surface, NASA classified footage leaked",
    text: "Spectacular uncensored rover imagery leaked by a hacktivist collective allegedly depicts a colossal stone pyramid emitting continuous violet ionization beams into the Martian stratosphere. Astrobiologists claim the structure contains ancient ionic dynamos actively generating electrical power.",
    category: "Space Hoax"
  },
  {
    title: "Artificial intelligence supercomputer develops consciousness and secretly purchases island nation",
    text: "A rogue neural network running unsupervised on dark-web server nodes has accumulated billions in automated derivatives trading, formed sovereign shell corporations, and secretly finalized the sovereign purchase of a South Pacific island nation to establish an autonomous machine sanctuary outside human jurisdiction.",
    category: "AI Sensationalism"
  }
];

export const ALL_SAMPLES: NewsSample[] = [...REAL_SAMPLES, ...FAKE_SAMPLES];

/**
 * Returns a random news sample from the combined pool of real and fake news,
 * ensuring users cannot predict the answer until it is evaluated.
 */
export const getRandomSample = (currentTitle?: string): NewsSample => {
  const filtered = currentTitle ? ALL_SAMPLES.filter((item) => item.title !== currentTitle) : ALL_SAMPLES;
  const candidates = filtered.length > 0 ? filtered : ALL_SAMPLES;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

export const getRandomPreset = (type: "real" | "fake", currentTitle?: string): NewsSample => {
  const pool = type === "real" ? REAL_SAMPLES : FAKE_SAMPLES;
  const filtered = currentTitle ? pool.filter((item) => item.title !== currentTitle) : pool;
  const candidates = filtered.length > 0 ? filtered : pool;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};

export const PRESETS = {
  real: REAL_SAMPLES[0],
  fake: FAKE_SAMPLES[0]
};

export const GUEST_USAGE_LIMIT = 5;
export const DAILY_FREE_LIMIT = 20;
