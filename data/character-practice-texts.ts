// Character-specific practice texts designed to maximize usage of each letter
export const characterPracticeTexts = {
  'a': `Amazing animals appear after April rain. Alaska attracts animals and amazing adventures await at Alaska's amazing areas. A large atlas and an aircraft approach an amazing area. Anna arranges apples and avocados at an amazing autumn market.`,
  
  'b': `Big brown bears bring bright berries before breakfast. Beautiful butterflies begin bouncing between bright blossoms. Bobby buys basic books about business before boarding boats. Brave boys build beautiful bridges between busy buildings.`,
  
  'c': `Curious cats catch colorful creatures carefully. Creative children create colorful crafts during chilly December. Clean cars cruise carefully across crowded city centers. Cool coffee comes with crispy cookies and classic chocolate cake.`,
  
  'd': `Dedicated doctors deliver detailed diagnoses during difficult days. Dancing dolphins dive deep down during dawn. Determined developers debug difficult code during deadline days. Dusty roads demand dedicated drivers during dangerous driving conditions.`,
  
  'e': `Energetic elephants exercise everywhere every evening. Expert engineers examine experimental equipment extremely effectively. Excellent examples emerge everywhere when experienced teachers explain essential elements. Every evening eagles engage in elegant aerial exercises.`,
  
  'f': `Funny frogs find fresh fruit for Friday's fantastic feast. Fast fighters fly fearlessly through foggy fields before Friday. Friendly farmers finish feeding farm animals before freezing February. Fresh flowers flourish freely in fertile fields during fall.`,
  
  'g': `Great green gardens grow gorgeous golden grapes gradually. Gentle giants gather glowing gems during gloomy gray mornings. Good guests grab great gifts from generous grandparents. Graceful gazelles gallop gracefully across grassy green grasslands.`,
  
  'h': `Happy horses hurry home through heavy hail during harsh hours. Hardworking humans handle heavy hardware with helpful hands. Honest hunters hide behind huge hills hunting hungry hawks. Healthy habits help humans handle harsh hardships with hope.`,
  
  'i': `Intelligent individuals imagine infinite innovations in inspiring institutions. Impressive insects inhabit intimate islands in isolated Indian territories. Important information indicates interesting investment insights in international industries. Independent investigators identify illegal items inside institutional buildings.`,
  
  'j': `Joyful jaguars jump joyously through jungle jungles during January. Jolly judges judge jury cases justly in June. Japanese journalists journey to Jamaica investigating jewelry thefts. Jumping jackrabbits jolt jockeys during jaunty June journeys.`,
  
  'k': `Kind kings keep knowledge keys kept in kitchen kingdoms. Keen kids kick kites higher keeping kites kinetic continuously. Knowledgeable knights know keeping kingdoms kind keeps kings kingly. Kittens kindly keep kitchen areas kept clean during keen keeping.`,
  
  'l': `Large lions live lazily lying under tall trees during late July. Lucky ladies love lovely lilies lining long lake landscapes. Little lambs leap lightly through lovely lavender fields last July. Laughing llamas like lovely lakes located in lush landscapes.`,
  
  'm': `Mighty mountains make magnificent memories for many mountain climbers. Modern machines manufacture multiple materials making many amazing products. Mysterious moons make magical moments during midnight March mornings. Many mammals migrate many miles making magnificent movements monthly.`,
  
  'n': `Numerous nations need new technologies navigating natural environmental concerns. Nine nightingales sing noisily near northern neighborhoods during November nights. Nervous nurses need new equipment now managing numerous national emergencies. Natural environments need nurturing now preventing numerous negative consequences.`,
  
  'o': `Older owls observe other outdoor objects on October mornings optimistically. Organized operations offer opportunities opening optional outdoor recreational programs. Outstanding organizations operate offering optional outdoor adventure opportunities. Obvious obstacles often occur obstructing ongoing operations occasionally.`,
  
  'p': `Purple parrots pick precious pearls from pretty pink petals purposefully. Professional programmers produce powerful programs preventing potential performance problems. Patient people practice perfect piano pieces preparing public performances. Passionate photographers photograph pretty purple poppies during perfect spring periods.`,
  
  'q': `Quiet queens question quality quickly during quarterly quality assurance quarters. Quirky quail quietly queue queuing quietly near quaint Quebec quarters. Qualified quarterbacks quickly quit questioning quality quarterback techniques. Quizzical squirrels quietly seek quality quarters during quiet quarterly periods.`,
  
  'r': `Rapid rivers run roughly through rocky regions during rainy seasons. Red roses require regular care reaching remarkable results rapidly. Responsible researchers review research reports regularly ensuring reliable results. Rural residents raise rare rabbits requiring regular routine care.`,
  
  's': `Silent snakes slide slowly through sunny spaces seeking sustenance successfully. Strong students study seriously solving sophisticated scientific subjects systematically. Seasoned sailors sail safely through stormy seas showing superior seamanship. Sweet strawberries shine splendidly in sunny spring seasons.`,
  
  't': `Tall trees tower triumphantly throughout temperate territories during autumn transitions. Technical teams test technologies thoroughly throughout testing timeframes. Traditional teachers teach talented students theoretical topics through thoughtful tutorials. Tiny turtles travel tremendous distances through treacherous terrain.`,
  
  'u': `Unusual unicorns unite under umbrellas during unexpected summer thunderstorms. University students understand unique subjects using updated educational resources. Useful utilities support urban users utilizing underground infrastructure systems. Ultimate understanding usually results from using updated educational methodologies.`,
  
  'v': `Various vehicles visit vast valleys viewing volcanic volcanic landscapes visually. Valuable vintage violins create vivid musical vibrations very effectively. Volunteer veterinarians visit various villages providing vital veterinary services. Verdant vineyards value varied vine varieties producing valuable vintage varieties.`,
  
  'w': `Wild wolves wander widely through wooded wilderness during winter weather. Wise wizards weave wonderful spells while wandering through weird worlds. Wealthy women wear wonderful white wedding dresses while walking. Working writers write wonderful words while waiting within warm workspaces.`,
  
  'x': `Expert boxers exhibit excellent boxing techniques during exciting exhibitions regularly. Complex explanations examine extremely experimental procedures extensively. Maximum exposure maximizes expected results exactly exceeding expectations. Mixed exercises extend existing expertise expanding exceptional experimental experiences.`,
  
  'y': `Young yellow dogs play joyfully yet carefully yesterday during sunny weather. Yearly visits yield youthful memories yet require yearly planning strategies. Youthful gymnasts practice gymnastics yearly yet need yearly safety training. Yesterday's activities yielded positive results yet require yearly evaluations.`,
  
  'z': `Zealous zebras zigzag through amazing zoo zones during freezing winters. Zestful chefs utilize zesty spices creating amazing pizzas with zeal. Puzzling mazes amaze visitors utilizing zigzag patterns maximizing amazing experiences. Dazzling fireworks amaze zones full of amazed spectators during zealous celebrations.`
};

// Additional complex practice texts combining multiple weak characters
export const combinedCharacterTexts = {
  'difficult_combinations': `The quick brown fox jumps over the lazy dog. Complex examples maximize typing experiences exponentially. Puzzling questions require exceptional explanations examining complex procedures extensively. Amazing gymnastics exhibitions demonstrate exceptional flexibility maximizing zealous amazement.`,
  
  'common_mistakes': `The their there they're through though thought three thirty thirteen. Weather whether where were we're when while which why what who whom whose. Your you're yonder years yellow yesterday young youth youthful yielding.`,
  
  'special_characters': `Hello! How are you? I'm fine, thanks. Let's go to the park @ 3:00 PM. The cost is $25.99 (including tax). Email me at user@example.com for more info. "Great work!" she exclaimed. It's 50% off today.`,
  
  'numbers_and_symbols': `Password123! costs $45.67 @ 9:30 AM. Call (555) 123-4567 or email info@company.com. The ratio is 3:1, approximately 75%. Order #A1B2C3 ships via UPS & arrives in 2-3 days.`
};

// Function to get practice text for a specific character
export function getPracticeText(character: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): string {
  const char = character.toLowerCase();
  
  // Base text for the character
  let baseText = characterPracticeTexts[char as keyof typeof characterPracticeTexts] || characterPracticeTexts['a'];
  
  if (difficulty === 'easy') {
    // Return first half of the text
    const words = baseText.split(' ');
    return words.slice(0, Math.ceil(words.length / 2)).join(' ');
  } else if (difficulty === 'hard') {
    // Combine with common mistakes or complex patterns
    return baseText + ' ' + combinedCharacterTexts.common_mistakes;
  }
  
  return baseText;
}
