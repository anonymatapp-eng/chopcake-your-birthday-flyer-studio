// Curated birthday messages. 50-char max each.
export const messageLibrary: string[] = [
  "Wishing you joy that lasts all year long!",
  "Another year of being wonderfully you. 🎉",
  "Cake, laughter, love — you deserve it all.",
  "Here's to your brightest year yet!",
  "May today sparkle as much as you do.",
  "Big love on your big day!",
  "You make the world warmer. Happy Birthday!",
  "Celebrating every beautiful thing about you.",
  "Cheers to new chapters and old friends.",
  "Dream big, eat cake, repeat.",
  "Sending you sunshine on your special day.",
  "The world got luckier the day you arrived.",
  "May your year overflow with good things.",
  "You + cake = perfect day. Enjoy!",
  "Hope today is just the start of magic.",
  "Birthdays are nature's way of saying thanks.",
  "Stay golden — happy birthday, friend!",
  "May this year out-sparkle the last.",
  "Wishing you all your favorite things today.",
  "You light up rooms. Happy Birthday, star!",
  "Another lap around the sun — well done!",
  "Make a wish. Then make it happen.",
  "Toasting to you and everything ahead.",
  "Today, the world celebrates you.",
  "Joy on tap. Happy Birthday!",
  "Be loud, be loved, be celebrated.",
  "May your coffee be strong and your day fun.",
  "More cake, less worry. Happy Birthday!",
  "Wishing you peace, love, and second slices.",
  "You bring the magic — today, it's yours.",
  "Hope today feels like your favorite song.",
  "Cheers to you, always and especially today.",
  "May your year be soft, sweet, and bold.",
  "Here's to laughter that hurts your cheeks.",
  "You deserve every good thing, today and on.",
  "A whole year of you — what a gift!",
  "Sending warm hugs and warmer wishes.",
  "May luck follow you everywhere this year.",
  "Eat the cake. All of it. You earned it.",
  "Today belongs entirely to you.",
  "Wishing you wonders, wins, and wonder.",
  "May your dreams arrive on time this year.",
  "You're a whole vibe. Happy Birthday!",
  "Bigger plans, bigger cake, bigger love.",
  "Hope this year hugs you back.",
  "Celebrate loudly — you absolutely deserve to.",
  "Another beautiful chapter begins. Enjoy!",
  "May joy chase you down all year long.",
  "Stay rare, stay you. Happy Birthday!",
  "Today: pure, unfiltered celebration.",
  "Wishing you everything your heart hopes for.",
  "Sparkles on your cake and your year.",
  "Here's to growth, glow, and good times.",
  "You're the gift. Happy Birthday!",
  "May this year treat you like royalty.",
  "Cheers to a year that says yes back.",
  "Today is your encore. Take a bow.",
  "Sending you all the soft, lovely things.",
  "Hope this year is your favorite yet.",
  "You + this year = unstoppable.",
];

export function pickThree(seed = Date.now()): string[] {
  const pool = [...messageLibrary];
  const out: string[] = [];
  let s = seed;
  for (let i = 0; i < 3 && pool.length; i++) {
    s = (s * 9301 + 49297) % 233280;
    const idx = Math.floor((s / 233280) * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export const captionLibrary: string[] = [
  "Celebrating someone special today 🎂✨ #BirthdayLove",
  "Sending all the joy your way 💖 Made with ChopCake",
  "Another year of you — and we're so here for it 🎉",
];
