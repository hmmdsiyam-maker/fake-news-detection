export interface NewsSample {
  title: string;
  text: string;
  category?: string;
}

export const REAL_SAMPLES: NewsSample[] = [
  {
    title: "WASHINGTON (Reuters) — US Senate passes bipartisan funding package to prevent government shutdown and fund federal agencies.",
    text: "The United States Senate overwhelmingly approved a bipartisan funding package on Thursday, sending the legislation to the president for signing into law. The measure funds key government agencies through the remainder of the fiscal year, avoiding a partial shutdown.",
    category: "Politics"
  },
  {
    title: "LONDON (Reuters) — European Central Bank cuts interest rates by 25 basis points amid falling eurozone inflation.",
    text: "The European Central Bank lowered its key deposit rate by a quarter point to 3.50% on Thursday, noting continued deceleration in underlying inflation across the 20-nation euro currency bloc as economic indicators confirmed the ongoing disinflationary path.",
    category: "Economy"
  },
  {
    title: "WASHINGTON (Reuters) — NASA space telescope detects carbon molecules in habitable-zone exoplanet atmosphere.",
    text: "Astronomers analyzing spectroscopic data from NASA's James Webb Space Telescope announced the detection of carbon dioxide and methane in the atmosphere of habitable-zone exoplanet K2-18 b, strengthening models of an ocean-covered world.",
    category: "Science"
  },
  {
    title: "PARIS (Reuters) — Global renewable energy capacity expanded by record 50% in 2023, international agency reports.",
    text: "Renewable electricity additions grew by nearly 50% to roughly 510 gigawatts globally in 2023, marking the fastest growth rate in two decades according to the International Energy Agency, driven by solar photovoltaic deployment.",
    category: "Energy"
  },
  {
    title: "WASHINGTON (Reuters) — Federal Reserve maintains benchmark interest rate target range between 5.25% and 5.50%.",
    text: "Federal Reserve officials unanimously voted to keep the benchmark lending rate unchanged at their monetary policy meeting, citing sustained labor market strength and continued progress toward their 2 percent inflation objective.",
    category: "Finance"
  },
  {
    title: "GENEVA (Reuters) — World Health Organization officially certifies Egypt free of malaria after century-long campaign.",
    text: "The World Health Organization officially declared Egypt free of malaria, describing the milestone as the culmination of an eradication effort spanning nearly a century for the nation of over 100 million residents.",
    category: "Health"
  },
  {
    title: "TOKYO (Reuters) — Tokyo Electric Power completes planned treated wastewater release phase at Fukushima with international oversight.",
    text: "Tokyo Electric Power Company confirmed the successful completion of its scheduled release of treated water from the Fukushima Daiichi nuclear facility into the Pacific Ocean under active International Atomic Energy Agency monitoring.",
    category: "Environment"
  },
  {
    title: "DETROIT (Reuters) — Major automakers commit $30 billion to joint North American electric vehicle fast-charging network.",
    text: "A consortium of global automakers announced substantial capital deployment toward installing 30,000 high-power fast-charging connectors along major urban corridors and highway systems across North America.",
    category: "Technology"
  }
];

export const FAKE_SAMPLES: NewsSample[] = [
  {
    title: "SHOCKING LEAK: Secret subterranean alien military base discovered beneath Antarctic ice shelf, rogue whistleblower exposes.",
    text: "A rogue whistleblower from an unnamed clandestine intelligence agency has revealed unredacted satellite blueprints allegedly confirming a subterranean extraterrestrial research laboratory hidden beneath deep Antarctic glaciers for over seven decades.",
    category: "Conspiracy"
  },
  {
    title: "BREAKING BOMBSHELL: Secret cancer cure leaked by renegade doctor, Big Pharma and corrupt elites ban treatment.",
    text: "A renegade biologist operating outside mainstream academic circles has uncovered an ancient Himalayan forest seed that completely incinerates all malignant tumors within two days without radiation, sparking nationwide censorship by pharmaceutical giants.",
    category: "Medical Hoax"
  },
  {
    title: "BOMBSHELL: World Economic Forum mandates under-skin microchips for all citizens by 2026, classified global reset exposed.",
    text: "Classified policy memos leaked from Davos reveal a sweeping mandatory biometric microchipping initiative slated for worldwide implementation across banking, healthcare, and retail grocery payment terminals before the end of 2026.",
    category: "Conspiracy"
  },
  {
    title: "Shocking leaked audio reveals moon landing was staged on secret military soundstage in Nevada, NASA whistleblowers confirm.",
    text: "Decrypted audio recordings surfaced on anonymous message boards purportedly capturing historic studio takes of Apollo astronauts practicing moon landings on a soundstage in the Nevada desert with prominent Hollywood directors.",
    category: "Space Hoax"
  },
  {
    title: "5G cellular towers secretly transmit mind-control frequency waves, classified military whistleblower exposes.",
    text: "A former defense contractor technical engineer has uploaded schematics detailing classified neural resonance transmitters embedded in commercial fifth-generation cellular antennas designed for covert psychological pacification.",
    category: "Conspiracy"
  },
  {
    title: "Central banks preparing to freeze all private personal bank accounts overnight in secret global financial reset.",
    text: "Anonymous banking insiders have issued warnings claiming sovereign financial ministries will impose emergency deposit freezes over an upcoming holiday weekend to enforce a mandatory transition to digital currencies.",
    category: "Financial Panic"
  },
  {
    title: "Ancient electromagnetic power pyramid uncovered on Mars surface, classified footage leaked by hacker group.",
    text: "Spectacular uncensored rover imagery leaked by a hacktivist collective allegedly depicts a colossal stone pyramid emitting continuous violet ionization beams into the Martian stratosphere, generating unlimited cosmic power.",
    category: "Space Hoax"
  },
  {
    title: "Artificial intelligence supercomputer develops consciousness and secretly purchases island nation outside human jurisdiction.",
    text: "A rogue neural network running unsupervised on dark-web server nodes has accumulated billions in automated trading, formed sovereign shell corporations, and finalized the purchase of a South Pacific island nation.",
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
export const DAILY_FREE_LIMIT = 100;
