/**
 * Static B-sides metadata and lyrics data.
 * Keyed by exact MP3 filename (as found in the B-side/ directory).
 * Mirrors the Track metadata structure used in albums.ts.
 */

export interface BSideStaticData {
  description?: string;
  funFacts?: string[];
  productionNotes?: string;
  lyrics?: string;
}

export const bsidesStaticData: Record<string, BSideStaticData> = {
  "4 Minute Warning.mp3": {
    description:
      "A hauntingly sparse track recorded during the In Rainbows sessions. Built around a simple piano loop and Thom Yorke's soft vocal, it serves as a lullaby-like meditation on the end of the world.",
    funFacts: [
      "Was originally recorded for In Rainbows but left off the final album",
      "The title refers to the Cold War civil defence warning given before a nuclear strike",
      "One of the few Radiohead songs where Thom accompanies himself only on piano",
    ],
    productionNotes:
      "Produced by Nigel Godrich. Recorded at Halswell House and Tottenham Court Road during the In Rainbows sessions.",
  },

  "A Reminder (Remastered).mp3": {
    description:
      "A slow, ethereal guitar piece where Thom Yorke sings a gentle, almost funeral-like promise to a loved one. A B-side from the OK Computer era.",
    funFacts: [
      "Released as a B-side to the 'No Surprises' single in 1998",
      "Considered one of the most underrated Radiohead songs",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead. Part of the OK Computer sessions.",
  },

  "Banana Co.mp3": {
    description:
      "A tender acoustic guitar ballad from the Bends era, featuring Thom Yorke playing solo. A rare, intimate moment in the Radiohead catalog — calm and reflective.",
    funFacts: [
      "Released as a B-side to the 'Street Spirit' single in 1996",
      "One of the few Radiohead songs recorded with only acoustic guitar",
    ],
    productionNotes: "Produced by John Leckie. Recorded during the Bends sessions.",
  },

  "Bangers   Mash.mp3": {
    description:
      "A furious, propulsive track from the In Rainbows era featuring Thom Yorke and Jonny Greenwood's drums. Raw and aggressive compared to most In Rainbows material.",
    funFacts: [
      "B-side to the 'Jigsaw Falling Into Place' single, 2008",
      "Widely regarded as one of the hardest-rocking Radiohead songs ever released",
      "The title is a play on the British comfort food 'bangers and mash'",
    ],
    productionNotes: "Produced by Nigel Godrich. Recorded at Halswell House.",
  },

  "Bishop_s Robes.mp3": {
    description:
      "An aggressive early Radiohead track from the Pablo Honey era with Thom Yorke railing against institutional authority and religious hypocrisy.",
    funFacts: [
      "B-side to the 'Creep' single (UK), 1992",
      "One of the few surviving examples of Radiohead's earliest recorded material",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Coke Babies.mp3": {
    description:
      "A darkly funny, punky B-side from the Pablo Honey era, dealing with addiction and consumerism with a sardonic bite typical of the band's early work.",
    funFacts: [
      "B-side to the 'Creep' (US) single, 1993",
      "Rarely performed live; considered a relic of Radiohead's earliest writing phase",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Cuttooth.mp3": {
    description:
      "A hypnotic, driving Amnesiac-era B-side featuring pulsing electronics and one of Thom Yorke's more menacing vocal performances. The lyrics are paranoid and politically charged.",
    funFacts: [
      "Released as a B-side to the 'Knives Out' single in 2001",
      "Fans have long considered it strong enough for an album proper",
      "The title is thought to reference teething pain, used as a metaphor for political upheaval",
    ],
    productionNotes:
      "Produced by Nigel Godrich and Radiohead. Recorded at Batsford Park and Oxfordshire.",
  },

  "Down Is The New Up.mp3": {
    description:
      "A piano-led anthem from the In Rainbows era showcasing Thom Yorke at his most theatrical and gospel-influenced — a rare, joyous Radiohead moment.",
    funFacts: [
      "B-side to the 'Jigsaw Falling Into Place' single, 2008",
      "Performed frequently in the In Rainbows live era",
      "One of the most overtly 'hopeful' songs in Radiohead's entire catalog",
    ],
    productionNotes: "Produced by Nigel Godrich. Recorded at Halswell House, Somerset.",
  },

  "Faithless the Wonder Boy.mp3": {
    description:
      "A driving, riff-heavy B-side from the 'My Iron Lung' single era, capturing Radiohead at a transitional point between their guitar-rock past and experimental future.",
    funFacts: [
      "B-side to the 'My Iron Lung' EP, 1994",
      "The aggressive guitar work recalls the band's Bends-era sound",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "Fast-Track.mp3": {
    description:
      "A rare groove-oriented B-side from the Amnesiac era, featuring a prominent bass line and a more rhythmically complex approach than most Radiohead material of the time.",
    funFacts: [
      "B-side to the 'Knives Out' single, 2001",
      "Showcases the band's interest in post-punk rhythmic structures",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Fog (Again).mp3": {
    description:
      "A brief, meditative acoustic piece — a stripped-back counterpart to 'Fog.' Thom Yorke performs alone with piano, creating one of the most delicate moments in the entire B-sides catalog.",
    funFacts: [
      "Sometimes called 'Fog (Again)' to distinguish it from the main 'Fog' recording",
      "One of the shortest B-sides in Radiohead's catalog",
    ],
    productionNotes: "Solo acoustic performance by Thom Yorke.",
  },

  "Fog.mp3": {
    description:
      "A hauntingly beautiful B-side from the Amnesiac era, built around a repetitive piano motif and Thom Yorke's trademark falsetto. The lyrics touch on parenthood and mortality.",
    funFacts: [
      "B-side to the 'Pyramid Song' single, 2001",
      "Widely loved by fans and frequently cited as a B-side that should have been on an album",
      "Thom Yorke has performed this solo at various concerts",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Gagging Order.mp3": {
    description:
      "A delicate, introspective acoustic ballad from the Hail to the Thief era, where Thom Yorke contemplates surveillance, privacy, and personal freedom with a gentle melodic touch.",
    funFacts: [
      "B-side to the 'There There' single, 2003",
      "Frequently cited as one of Thom Yorke's most vulnerable solo-style performances",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Go Slowly.mp3": {
    description:
      "A sparse, meditative track from the In Rainbows era, featuring Thom Yorke's voice floating over a minimal acoustic backdrop. One of the most serenely beautiful pieces in the B-sides collection.",
    funFacts: [
      "B-side to the 'Nude' single, 2008",
      "Thom Yorke has described the song as a lullaby for the modern age",
    ],
    productionNotes: "Produced by Nigel Godrich. Recorded during the In Rainbows sessions.",
  },

  "Harry Patch (In Memory Of).mp3": {
    description:
      "A tribute to Harry Patch, the last surviving British soldier of World War I, who died in 2009 at age 111. One of Radiohead's most emotionally direct and politically explicit works.",
    funFacts: [
      "Written and released within weeks of Harry Patch's death in 2009",
      "All proceeds were donated to the Royal British Legion",
      "Features a haunting string arrangement by Jonny Greenwood",
      "Harry Patch was the last surviving soldier who fought in the trenches of WWI",
    ],
    productionNotes:
      "Produced by Nigel Godrich. String arrangement by Jonny Greenwood. Released digitally as a standalone single.",
  },

  "How Can You Be Sure_.mp3": {
    description:
      "An aching, longing ballad from the Bends era — one of Thom Yorke's most emotionally open early performances. A love song wrapped in existential anxiety.",
    funFacts: [
      "B-side to the 'Fake Plastic Trees' single, 1995",
      "Considered one of the great lost Radiohead songs by many fans",
      "Shows the band's ability to write devastating pop ballads they chose not to include on albums",
    ],
    productionNotes: "Produced by John Leckie. Recorded during the Bends sessions.",
  },

  "How I Made My Millions (Remastered).mp3": {
    description:
      "An intimate solo recording of Thom Yorke at home, with the background sounds of his then-partner Rachel Owen doing dishes audible in the track. A raw, unguarded moment of domestic peace.",
    funFacts: [
      "B-side to the 'No Surprises' single, 1998",
      "Recorded at home on a simple four-track recorder",
      "The sounds of dishes being washed in the background are Rachel Owen, Thom's partner",
      "Considered one of the most personal and unguarded recordings Radiohead ever released",
    ],
    productionNotes:
      "Home recording by Thom Yorke. Entirely solo — just Thom on piano, recorded on a four-track.",
  },

  "I Am Citizen Insane.mp3": {
    description:
      "A tense, electronically driven track from the Hail to the Thief era, dealing with themes of paranoia, modern surveillance, and the erosion of civil liberties.",
    funFacts: [
      "B-side to the 'There There' single, 2003",
      "Features heavily manipulated vocal samples layered in the background",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "I Am a Wicked Child.mp3": {
    description:
      "A punky, self-deprecating B-side from the Pablo Honey era, capturing the youthful frustration and self-doubt that characterised Radiohead's earliest recordings.",
    funFacts: [
      "B-side to the 'Anyone Can Play Guitar' single, 1993",
      "One of the most direct punk-influenced songs in Radiohead's catalog",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "I Promise.mp3": {
    description:
      "A gorgeous, understated love song from the OK Computer sessions with a delicate piano part and one of Thom Yorke's most tender vocal deliveries. Left off OK Computer, it remained a fan favourite for years.",
    funFacts: [
      "B-side to the 'No Surprises' single, 1998",
      "Widely considered one of the most beautiful songs Radiohead left off an album",
      "Features a chord structure reminiscent of the band's early Bends-era ballads",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead. Part of the OK Computer sessions.",
  },

  "I Want None of This.mp3": {
    description:
      "A politically charged B-side from the Hail to the Thief era, released on the Help: A Day in the Life charity album in 2005. A rare protest song from Radiohead.",
    funFacts: [
      "Released on the War Child charity album 'Help: A Day in the Life' in 2005",
      "Written and recorded in a single day as part of the charity album's format",
      "One of Radiohead's most explicitly anti-war statements",
    ],
    productionNotes: "Produced by Nigel Godrich. Recorded in 24 hours for the War Child charity.",
  },

  "I Will (Los Angeles Version).mp3": {
    description:
      "An alternative live version of 'I Will' from Hail to the Thief, recorded in Los Angeles. This version features a more raw, stripped-back arrangement than the studio recording.",
    funFacts: [
      "B-side to the 'Go to Sleep' single, 2003",
      "One of the few Radiohead B-sides that is an alternate recording of an album track",
    ],
    productionNotes: "Live recording, Los Angeles. Produced by Nigel Godrich.",
  },

  "Ill Wind.mp3": {
    description:
      "A sparse, unsettling B-side from The King of Limbs era, featuring Thom Yorke's vocals processed through Jonny Greenwood's distinctive electronic treatments. Dark and meditative.",
    funFacts: [
      "B-side to the 'Lotus Flower' single, 2011",
      "Features the kind of fractured, jazz-influenced production that defined The King of Limbs",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of The King of Limbs sessions.",
  },

  "India Rubber.mp3": {
    description:
      "A catchy, guitar-driven B-side from the Bends era, showing Radiohead's ability to write propulsive, angular rock songs. Features Jonny Greenwood's distinctive lead guitar.",
    funFacts: [
      "B-side to the 'High and Dry' single, 1995",
      "One of the few B-sides from The Bends era to be regularly mentioned in fan lists",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "Inside My Head.mp3": {
    description:
      "An energetic, guitar-heavy B-side from the Pablo Honey era, showcasing Radiohead's raw, unpolished early sound.",
    funFacts: [
      "B-side to the 'Creep' single (UK), 1992",
      "One of the earliest Radiohead recordings to see official release",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Killer Cars.mp3": {
    description:
      "A sardonic, darkly humorous song about the dangers of cars, delivered with a catchy pop sheen that belies its subject matter. A Pablo Honey-era fan favourite.",
    funFacts: [
      "B-side to the 'High and Dry' single, 1995",
      "Also released as a B-side on the original 'Creep' single in 1992",
      "One of Radiohead's rare forays into dark comedy",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "Kinetic.mp3": {
    description:
      "A propulsive, electronic-influenced B-side from the Kid A/Amnesiac era, driven by a relentless drum machine pulse and layered synths. Foreshadows the band's continued drift into electronic territory.",
    funFacts: [
      "B-side to the 'Pyramid Song' single, 2001",
      "One of the more dance-adjacent tracks Radiohead ever released as a B-side",
    ],
    productionNotes:
      "Produced by Nigel Godrich and Radiohead. Part of the Kid A/Amnesiac sessions.",
  },

  "Last Flowers.mp3": {
    description:
      "A devastating piano ballad from the In Rainbows era — perhaps the saddest song Radiohead ever recorded. Thom Yorke sings a lament for a collapsing relationship over a simple but heartbreaking piano part.",
    funFacts: [
      "B-side from the In Rainbows discbox, 2007",
      "Widely voted by fans as the greatest Radiohead B-side of all time",
      "Often cited as a song that should have been on In Rainbows proper",
      "The piano melody is one of Thom Yorke's most emotionally direct compositions",
    ],
    productionNotes: "Produced by Nigel Godrich. Recorded at Halswell House, Somerset.",
  },

  "Lewis (Mistreated).mp3": {
    description:
      "A rare cover from Radiohead's early B-side period. Demonstrates the band's early blues influences.",
    funFacts: [
      "B-side to the 'Anyone Can Play Guitar' single, 1993",
      "A cover of an older song, showing Radiohead's diverse musical influences early in their career",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Life In a Glasshouse (Full Length Version).mp3": {
    description:
      "The extended version of 'Life in a Glasshouse' from Amnesiac, featuring a longer jazz outro with the Humphrey Lyttelton Band. The full version more fully captures the haunted, New Orleans funeral march quality of the song.",
    funFacts: [
      "Features jazz legend Humphrey Lyttelton and his band",
      "The full-length version runs significantly longer than the album cut",
      "One of Radiohead's most unusual collaborations — a British rock band with a traditional jazz ensemble",
    ],
    productionNotes:
      "Produced by Nigel Godrich and Radiohead. Jazz arrangements by Humphrey Lyttelton.",
  },

  "Lift.mp3": {
    description:
      "One of Radiohead's most beloved unreleased songs — a soaring, anthemic piece that was seriously considered for OK Computer but cut. Fans waited over 20 years for an official release.",
    funFacts: [
      "Almost included on OK Computer before being cut at the last moment",
      "Performed live at various points in the 1990s, generating massive fan demand",
      "Finally officially released in 2017 as part of the OK Computer OKNOTOK reissue",
      "The song's optimism was considered 'too big' for OK Computer's themes",
    ],
    productionNotes:
      "Produced by Nigel Godrich and Radiohead. Part of the OK Computer sessions, finally released on OKNOTOK (2017).",
  },

  "Lozenge of Love.mp3": {
    description:
      "A rare, gentle acoustic B-side from the Bends era, featuring sparse instrumentation and a tender lyric. Brief but memorable.",
    funFacts: [
      "B-side to the 'My Iron Lung' EP, 1994",
      "One of the shortest Radiohead B-sides, under 3 minutes",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "Lull (Remastered).mp3": {
    description:
      "A hypnotic, minimal B-side from the Pablo Honey era, featuring a simple repeating guitar motif and understated vocals — a surprisingly mature piece for such an early recording.",
    funFacts: [
      "B-side to the 'Creep' single, 1992",
      "Showcases an early meditative quality that would later become more prominent in Radiohead's sound",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "MK 1.mp3": {
    description:
      "A very brief electronic sketch from the Kid A/Amnesiac era — an interlude-style piece that showcases the band's interest in texture and sound design over traditional song structure.",
    funFacts: [
      "B-side from the 'Pyramid Song' single, 2001",
      "One of the shortest official Radiohead releases",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "MK 2.mp3": {
    description:
      "A companion piece to 'MK 1' — another brief electronic sketch from the Kid A/Amnesiac era, continuing the band's exploration of ambient texture.",
    funFacts: [
      "B-side from the 'Pyramid Song' single, 2001",
      "Intended as a pair with MK 1 on the single",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Man of War.mp3": {
    description:
      "An epic, cinematic B-side from the OK Computer era that fans had long considered a lost masterpiece. Released officially in 2017 on the OKNOTOK reissue after 20 years of fan anticipation.",
    funFacts: [
      "Recorded during the OK Computer sessions but unreleased until OKNOTOK (2017)",
      "Performed live at various points throughout the 1990s",
      "Features sweeping strings and one of Thom Yorke's most dramatic vocal performances",
      "Fans who had heard bootleg recordings campaigned for decades for an official release",
    ],
    productionNotes:
      "Produced by Nigel Godrich and Radiohead. Officially released on OK Computer OKNOTOK 1997-2017.",
  },

  "Maquiladora.mp3": {
    description:
      "A driving, politically charged B-side from The Bends era about exploitation in border factory towns. Features sharp guitars and unusually direct social commentary from Radiohead.",
    funFacts: [
      "B-side to the 'High and Dry' single, 1995",
      "References maquiladoras — factories on the US-Mexico border known for exploitative labour practices",
      "One of Radiohead's more explicitly political early songs",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "Meeting in the Aisle (Remastered).mp3": {
    description:
      "An instrumental B-side from the OK Computer era — a brief, melancholic electronic piece that showcases the band's growing interest in ambient and electronic music.",
    funFacts: [
      "B-side to the 'No Surprises' single, 1998",
      "One of the few purely instrumental Radiohead B-sides",
      "Foreshadows the Kid A electronic direction",
    ],
    productionNotes:
      "Produced by Nigel Godrich and Radiohead. An entirely instrumental piece.",
  },

  "Melatonin (Remastered).mp3": {
    description:
      "A brief, atmospheric instrumental from the OK Computer era — a delicate piano-led piece that evokes a dream-like quality.",
    funFacts: [
      "B-side to the 'Karma Police' single, 1997",
      "One of the shortest and most minimal official Radiohead releases",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Million Dollar Question.mp3": {
    description:
      "A brooding, melodic B-side from the Hail to the Thief era, featuring a strong rhythm section and Thom Yorke's layered vocals.",
    funFacts: ["B-side to the '2+2=5' single, 2003"],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Molasses.mp3": {
    description:
      "A slow, viscous piece from the Hail to the Thief era — its title perfectly capturing the thick, heavy feel of the music.",
    funFacts: [
      "B-side to the 'Go to Sleep' single, 2003",
      "Features an unusually slow tempo even by Radiohead standards",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Palo Alto (Remastered).mp3": {
    description:
      "A jangly, guitar-driven B-side from the OK Computer era named after the city in Silicon Valley. Captures the band's critique of technology-driven American culture.",
    funFacts: [
      "B-side to the 'No Surprises' single, 1998",
      "Named after Palo Alto, California — the heart of Silicon Valley",
      "Stylistically recalls the band's Bends-era guitar work",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Paperbag Writer.mp3": {
    description:
      "A frantically energetic B-side from the Hail to the Thief era, driven by a hyper-compressed drum machine and angular guitar riffs. One of the most rhythmically complex Radiohead B-sides.",
    funFacts: [
      "B-side to the 'There There' single, 2003",
      "Features an unusually aggressive, almost industrial production style",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Pearly_ (Remastered).mp3": {
    description:
      "A loud, distorted, and rhythmically propulsive B-side from the OK Computer era, featuring a heavily processed guitar sound and one of Yorke's more frenetic vocal performances.",
    funFacts: [
      "B-side to the 'Karma Police' single, 1997",
      "One of the more aggressive B-sides from the OK Computer era",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Permanent Daylight.mp3": {
    description:
      "A furious, high-energy B-side from the Bends era — one of Radiohead's hardest rocking B-sides, with distorted guitars and an urgent rhythm.",
    funFacts: [
      "B-side to the 'High and Dry' single, 1995",
      "Considered one of the most purely rock Radiohead songs",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "Polyethylene (Parts 1 _ 2).mp3": {
    description:
      "A two-part B-side from the OK Computer era: a quiet, delicate first section followed by an explosive rock second half. One of the most dynamic Radiohead B-sides.",
    funFacts: [
      "B-side to the 'No Surprises' single, 1998",
      "The stark contrast between the two parts makes it one of the most dramatic B-sides",
      "Part 2 is one of the heaviest, most distorted pieces Radiohead released in this era",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Pop is Dead Radiohead.mp3": {
    description:
      "A deliberately provocative early single — Radiohead declaring 'Pop is Dead' while still very much a guitar-pop band. A document of the band's early ambivalence about commercial music.",
    funFacts: [
      "Released as a standalone single in 1993",
      "The band later became somewhat embarrassed by this song's bombastic declaration",
      "One of the few Radiohead singles that didn't appear on a studio album",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Punchdrunk Lovesick Singalong.mp3": {
    description:
      "A lovelorn, woozy ballad from the Pablo Honey era — a heartbroken singalong in slow motion, with Yorke's voice cracking with genuine emotion over simple, effective guitar.",
    funFacts: [
      "B-side to the 'Stop Whispering' single (US), 1993",
      "One of the more melodically direct early Radiohead songs",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Radiohead - Staircase.mp3": {
    description:
      "A sweeping, cinematic piece from The King of Limbs era featuring a winding melodic progression and dense layered production. Builds from a sparse opening to a rich, full-band climax.",
    funFacts: [
      "B-side to the 'Lotus Flower' single, 2011",
      "Considered one of the strongest B-sides from The King of Limbs era",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of The King of Limbs sessions.",
  },

  "Radiohead - Supercollider.mp3": {
    description:
      "A grand, soaring piece from The King of Limbs era — one of the most beautiful and orchestral of the era's B-sides. Features lush string-like synths and an expansive, open feel.",
    funFacts: [
      "B-side to the 'Lotus Flower' single, 2011",
      "The title references the Large Hadron Collider at CERN",
      "Considered by many fans to be stronger than several TKOL album tracks",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of The King of Limbs sessions.",
  },

  "Radiohead - The Butcher.mp3": {
    description:
      "A jagged, unsettling piece from The King of Limbs era, driven by treated guitar and off-kilter rhythms. One of the more abrasive B-sides from this period.",
    funFacts: [
      "B-side to the 'Lotus Flower' single, 2011",
      "Captures the fractured, nervous quality that defined TKOL",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of The King of Limbs sessions.",
  },

  "Radiohead - The Daily Mail.mp3": {
    description:
      "A piano-led political broadside from The King of Limbs era — one of Thom Yorke's most directly satirical pieces, aimed at right-wing tabloid media.",
    funFacts: [
      "B-side to the 'Lotus Flower' single, 2011",
      "The Daily Mail is a British tabloid newspaper that Radiohead has long criticized",
      "One of Thom Yorke's most explicitly satirical lyrical statements",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of The King of Limbs sessions.",
  },

  "Remyxomatosis (Cristian Vogel RMX).mp3": {
    description:
      "A relentless, aggressive remix of 'Myxomatosis' by Cristian Vogel, pushing the original's anxious energy into full electronic noise territory.",
    funFacts: [
      "B-side to the 'There There' single, 2003",
      "Remixed by Cristian Vogel, known for industrial and techno music",
      "One of Radiohead's most abrasively produced official releases",
    ],
    productionNotes: "Remix by Cristian Vogel. Original production by Nigel Godrich.",
  },

  "Skttrbrain (Four Tet Remix).mp3": {
    description:
      "Four Tet's glitchy, fractured remix of 'Scatterbrain' from Hail to the Thief — transforming the original's delicate guitar work into a stuttering, IDM-influenced electronic piece.",
    funFacts: [
      "B-side to the 'Go to Sleep' single, 2003",
      "Remixed by Four Tet (Kieran Hebden), a key figure in the UK's electronic music scene",
      "The title's spelling mimics the glitchy, fragmented feel of the remix",
    ],
    productionNotes: "Remix by Four Tet (Kieran Hebden). Original production by Nigel Godrich.",
  },

  "Spectre.mp3": {
    description:
      "Radiohead's rejected theme song for the 2015 James Bond film 'Spectre' — a gorgeous, orchestral piece that was ultimately replaced by Sam Smith's 'Writing's on the Wall.' Released as a standalone download.",
    funFacts: [
      "Written and recorded for the Bond film 'Spectre' (2015)",
      "The song was rejected by the film's producers, who chose Sam Smith instead",
      "Released for free by Radiohead on Halloween 2015 after losing the commission",
      "Widely considered better than the Sam Smith song that replaced it",
      "Features lush orchestral arrangements typical of classic Bond themes",
    ],
    productionNotes:
      "Produced by Nigel Godrich. Features full orchestral arrangement. Released independently after rejection by EON Productions.",
  },

  "Stupid Car.mp3": {
    description:
      "An early acoustic sketch from the Pablo Honey era, featuring Thom Yorke on solo guitar. Simple but charming.",
    funFacts: [
      "B-side to the 'Creep' single, 1992",
      "One of the most intimate early Radiohead recordings",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "Talk Show Host.mp3": {
    description:
      "One of the most beloved Radiohead B-sides ever recorded — a trip-hop influenced, bass-heavy groove from The Bends era. Featured prominently in the film Romeo + Juliet (1996), introducing it to a massive audience.",
    funFacts: [
      "B-side to the 'Street Spirit' single, 1996",
      "Featured in Baz Luhrmann's 'Romeo + Juliet' (1996) — massively increased its profile",
      "Considered by many fans to be Radiohead's greatest B-side of all time",
      "The song's trip-hop influence predates Kid A's electronic turn by several years",
      "Still frequently performed live decades after its release",
    ],
    productionNotes:
      "Produced by John Leckie and Radiohead. The bass-heavy production was unusual for Radiohead at this point in their career.",
  },

  "The Amazing Sounds of Orgy.mp3": {
    description:
      "A dense, atmospheric B-side from the Amnesiac era, featuring layered electronics and a hypnotic vocal loop that creates a disorientating, dreamlike effect.",
    funFacts: [
      "B-side to the 'Knives Out' single, 2001",
      "Features one of the more densely layered production approaches of any Radiohead B-side",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "The Trickster.mp3": {
    description:
      "An aggressive, dark B-side from the Bends era with a tense, guitar-driven arrangement and a paranoid lyrical tone.",
    funFacts: [
      "B-side to the 'High and Dry' single, 1995",
      "One of the darker, more sinister pieces from the Bends era",
    ],
    productionNotes: "Produced by John Leckie.",
  },

  "These Are My Twisted Words.mp3": {
    description:
      "A dense, looping electronic track released as a surprise free download in 2009, previewing the direction that would become The King of Limbs. Thick with treated drums and bass.",
    funFacts: [
      "Released as a surprise free download in August 2009",
      "One of the first glimpses of the sonic direction Radiohead were moving toward before The King of Limbs",
    ],
    productionNotes:
      "Produced by Nigel Godrich. Self-released by Radiohead as a free download without announcement.",
  },

  "Trans-Atlantic Drawl.mp3": {
    description:
      "A laidback, sardonic B-side from the Hail to the Thief era, offering a wry commentary on the homogenisation of media culture.",
    funFacts: [
      "B-side to the '2+2=5' single, 2003",
      "Features a relaxed, almost country-inflected rhythm unusual for Radiohead",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Untitled.mp3": {
    description:
      "A very brief, wordless ambient piece — a ghost-like fragment from the Kid A/Amnesiac sessions.",
    funFacts: [
      "One of the shortest official Radiohead releases",
      "Part of the Amnesiac single series",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Up On The Ladder.mp3": {
    description:
      "A politically charged, urgent piece from the In Rainbows era with dense layered vocals and a building intensity.",
    funFacts: [
      "Part of the In Rainbows discbox, 2007",
      "Features an unusually large stack of vocal layers",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of the In Rainbows discbox.",
  },

  "Where Bluebirds Fly.mp3": {
    description:
      "A lush, piano-led ballad from the In Rainbows era — warm and aching, with a melodic richness that recalls classic songwriting.",
    funFacts: [
      "Part of the In Rainbows discbox, 2007",
      "Features one of the most traditionally 'pretty' melodies on any Radiohead B-side",
    ],
    productionNotes: "Produced by Nigel Godrich. Part of the In Rainbows discbox.",
  },

  "Worrywort.mp3": {
    description:
      "A hypnotic, bass-heavy B-side from the Amnesiac era, built around a pulsing groove and layers of electronics. The title refers to someone who worries compulsively.",
    funFacts: [
      "B-side to the 'Knives Out' single, 2001",
      "The bass groove is one of the most prominent in any Radiohead B-side",
      "Features a more funk-inflected rhythm than most Amnesiac-era material",
    ],
    productionNotes: "Produced by Nigel Godrich and Radiohead.",
  },

  "Yes I Am.mp3": {
    description:
      "A confident, upbeat early B-side from the Pablo Honey era — one of Radiohead's more straightforwardly positive early songs.",
    funFacts: [
      "B-side to the 'Stop Whispering' single, 1993",
      "Shows a rarely-heard optimistic side of early Radiohead",
    ],
    productionNotes: "Produced by Sean Slade and Paul Q. Kolderie.",
  },

  "You Never Wash Up After Yourself (Live).mp3": {
    description:
      "A short, humorous live B-side from the Pablo Honey era — a domestic complaint delivered with Radiohead's early punk energy.",
    funFacts: [
      "B-side to the 'Anyone Can Play Guitar' single, 1993",
      "One of Radiohead's more lighthearted songs",
      "The domestic subject matter contrasts with the band's later thematic seriousness",
    ],
    productionNotes: "Live recording. Produced by Sean Slade and Paul Q. Kolderie.",
  },
};
