# Bridgify — מערכת העיצוב והשפה של האתר

עודכן: 10 בנובמבר 2026. הערכים נמדדו בקוד ובדפדפן (1440×900 ו־390×844) על `main` בקומיט `2f422af`. הנחיה חדשה ומפורשת של המשתמש גוברת על המסמך.

> **מקור האמת הוא דף הבית בגרסה 2** — `index-v2.html`, בכתובת `/?version=2`. זו השפה המעודכנת של Bridgify.
>
> כל עמוד, סקשן או רכיב חדש נבנים לפי V2. העמודים הפנימיים ו־V1 מתיישרים אליו, לא להפך. כשיש ספק: פותחים את V2, מוצאים את הדפוס הקרוב, ומשתמשים בו.

**סדר עדיפויות:** הנחיית משתמש מפורשת ← `AGENTS.md` ← המסמך הזה (V2) ← `TYPOGRAPHY.md` ← CSS של עמוד ספציפי.

**קבצי V2:**

| קובץ | תוכן |
| --- | --- |
| `index-v2.html` | המבנה |
| `hero-v2.css/js`, `hero-funnel-v2.css/js` | ההירו ואנימציית הכאוס־לסדר |
| `hero-stack-v3.css/js` | הירו המגדל (`?version=3`) |
| `supply-count-v2.js` | מונים |
| `opportunity-v2.css/js`, `opportunity-study.css` | השוואת "Building it yourself / With Bridgify" |
| `capability-visuals-v2.css` | רצף Why Bridgify |
| `home-intent-v2.css`, `personalization-intent.css/js` | דמו AIyelet |
| `products-v2.css/js`, `marketplace-launch.css` | אקורדיון המוצרים |
| `enterprise-v2.css/js` | סקשן Enterprise |
| `homepage-v2.css/js` | צבע המדגיש `.v2-ink`, חשיפת הסקשנים |
| `scroll-entrances.css/js` | כניסות בגלילה |

**שכבות משותפות לכל האתר — מעדכנים, לא משכפלים:**

| קובץ | תפקיד |
| --- | --- |
| `brand-typography.css` | טוקני `--type-*` |
| `brand-consistency.css` | כפתור `.brand-action` |
| `brand-section-labels.css` | תווית סקשן |
| `brand-material.css` | זכוכית חמה |
| `bridgify-logo-current.css` | לוגו ו־LOG IN |
| `bridgify-nav-motion.js` | תפריטי הניווט |
| `partials/` + `shared-footer.css/js` | הפוטר; מסונכרן ב־`scripts/sync-footer.py` |
| `homepage-version.js` | ניתוב הגרסאות |

---

## 1. מי אנחנו ומה האתר מעביר

Bridgify, חלק מ־HBX Group, היא התשתית שמאחורי חוויות טיולים: חיבור אחד ליותר ממיליון סיורים, אטרקציות, פעילויות ואירועים. החוויות מגיעות לאפליקציה, לאתר או לתוכנית הנאמנות של הלקוח, תחת המותג שלו. Bridgify מריצה מאחורי הקלעים את האספקה, ההפצה וההתאמה האישית.

- **הבטחה (Hero של V2):** “One connection. A million+ travel experiences, matched to *every customer.*”
- **חתימה (פוטר):** “Bridgify. *The infrastructure behind travel experiences.*”
- **נקודות הוכחה:** Part of HBX Group · 1M+ experiences · 180+ countries. ברצועת המספרים מופיעים גם: 1 Integration · 3% Average conversion* · $280 Average order value*. הכוכבית מפנה ל־“White-Label Marketplace partner metrics” וחובה להציג אותה.
- **ארבע היכולות** (Why Bridgify): Aggregate · Normalize · Distribute · Personalize.

| מוצר | שם קבוע | שורת משנה ב־V2 | עמוד |
| --- | --- | --- | --- |
| API | Experiences API | Build it your way. | `api.html` · `/experiences-api` |
| חנות ממותגת | White-Label Marketplace | No developers needed. Live in 3 days. | `marketplace.html` · `/white-label-marketplace` |
| התאמה אישית | AIyelet (בניווט: AIyelet: AI personalization) | Inside both products | `personalization.html` · `/aiyelet` |

**קהלים** (כרטיסי V2 → עמוד):

| כרטיס | עמוד |
| --- | --- |
| OTAs | `otas.html` |
| Airlines | `airlines.html` |
| Hotels | `hotels.html` |
| Loyalty & Finance | `loyalty-finance.html` |
| Travel Tech | `travel-technology.html` |
| Super apps and consumer platforms | `super-apps.html` |

## 2. שפה וכתיבה — כפי שהיא כתובה ב־V2

- **כותרת בשני חלקים:** אמירה ואז מפנה. החלק השני מקבל דיו קורל (`<em class="v2-ink">`). דוגמאות מ־V2:
  - “Your customers already book experiences. Just *not with you.*”
  - “Don't give travelers a library. Give them *the right book.*”
  - “Three products. One *connected layer.*”
  - “Built for brands that already have *the traveler*”
  - “Built for the bank and *the super app*”
  - “Who we *work with*”
  - “Frequently *asked questions*”
- **צבע מדגיש** הולך על המילים שמבטאות את התועלת ללקוח, לא על שם המותג. כותרת אחת = מדגיש אחד.
- **אנגלית אמריקאית**, משפטים קצרים והצהרתיים, נקודה בסוף כותרות (חוץ מכותרות רשימה כמו “Who we work with”).
- **הלקוח במרכז:** “your customers”, “your brand”, “your product”. Bridgify היא התשתית שמאחור.
- **השוואה ישירה:** “Building it yourself:” מול “With Bridgify:”, עם שלוש נקודות קונקרטיות בכל צד (“the same museum ticket listed five times” / “de-duplicated content”).
- **מספרים ומדדים:** תמיד עם תווית קצרה, ומקור כשהם של מוצר מסוים (“3× the conversion of standard travel marketplaces”).
- **CTA:**
  - **ראשי:** “Book a demo ↗”
  - **מוצרי:** “How the Experiences API works ↗”, “Explore the Experiences API →”
  - **טקסט:** “Meet AIyelet ↗”, “Experiences for OTAs ↗”
  - **גלילה:** “See how it works ↘”
  - **חצים:** ↗ = מעבר לעמוד; ↘ = גלילה בעמוד; → = המשך בתוך רכיב או מוצר.
- **ניווט ותוויות:** אותיות גדולות (PRODUCTS · WHY BRIDGIFY · AUDIENCES · OUR PARTNERS). כותרות משנה ופריטי FAQ — באותיות רגילות.
- **אסור להמציא:** מספרים, לקוחות, לוגואים, ציטוטים, תמחור, צוות, כתובות URL. דמואים מסומנים: “Illustrative product preview”, “Illustrative intent example”, “Illustrative”. פריטים שממתינים לאישור נמצאים ב־`CONTENT-V4-REVIEW.md`.

## 3. „ברמה שלהם” ורפרנסים

כשמבקשים סקשן „ברמה של הרפרנסים” או „בשפה שלנו”, מעצבים קומפוזיציה שלמה כמו ב־V2: תוכן, היררכיה, ריווח, חומר, תאורה, תנועה ומעבר לשכנים. רקע והילה לבדם אינם מענה. שומרים על היקף הבקשה: קונספט בתמונה כשמבקשים לראות רעיון, ויישום כשמבקשים לבנות. אין להציג קונספט כאילו יושם.

- **Stōkt** — https://wearestokt.com/ — איכות חומר, קומפוזיציה מרווחת, מוקד ויזואלי מובחן.
- **EnduroSat Space Service** — https://www.endurosat.com/space-service/ — מסע בגלילה, במה רחבה, רציפות בין מצבים.

הרפרנסים קובעים רף איכות; הזהות של Bridgify היא V2. אין לייבא לוויינים, כוכבים או כחול. (קובץ ההערות הישן `stokt-reference-notes.md` לא נמצא במחשב.)

## 4. אנטומיית V2 — הקצב של העמוד

V2 בנוי מסקשנים כהים וקרם לסירוגין. כל סקשן כהה הוא במה לאיור; כל סקשן קרם הוא נשימה עם תוכן ממוקד.

| # | סקשן (`id`) | רקע | תווית | תפקיד | דפוס ויזואלי |
| --- | --- | --- | --- | --- | --- |
| 1 | `#home` Hero | כהה `#180F10` + הילת קורל 7% | THE INFRASTRUCTURE BEHIND TRAVEL EXPERIENCES | ההבטחה | אנימציית כאוס→סדר: כרטיסי חוויות, כבלים, מכשירים |
| 2 | `#sources` | קרם `#EEE9DE` | — | הוכחה במספרים | כותרת קטנה + 5 מונים עם קווי הפרדה + כפתור עם חץ בריבוע |
| 3 | `#opportunity-study` | כהה `#100A08` | — | הבעיה | כותרת ממורכזת, שני טורי טקסט, פס "Bridgify does the connecting once", שני פאנלים להשוואה |
| 4 | `#why-bridgify` | כהה `#100C08` | WHY BRIDGIFY | איך זה עובד | רצף נעוץ (sticky) בגלילה, 4 שלבים עם טאבים בצד |
| 5 | `#personalization` | קרם | AIYELET · PERSONALIZATION | התאמה אישית | כותרת משמאל, טקסט מימין, ופאנל דמו בהיר רחב |
| 6 | `#products` | כהה `#100D0E` | PRODUCTS | המוצרים | אקורדיון משמאל + במה מאוירת מימין, "Scroll to explore", 01/03 |
| 7 | `#audiences` | קרם | AUDIENCES | למי | גריד 3×2 עם קווי הפרדה, אייקון קורל, כותרת וקישור |
| 8 | `#marketplace-results` | כהה `#120C0A` | — | Enterprise | טקסט משמאל, כרטיס מדד "3×" מימין, שכבות זכוכית תלת־ממדיות |
| 9 | `#partners` | קרם | OUR PARTNERS | לקוחות | שורת סימני מילים בתאים עם קווי הפרדה |
| 10 | `#faq` | קרם | — | שאלות | `details` עם קווי הפרדה |
| 11 | `#contact` פוטר | `#160F0D` | — | סגירה | CTA חוזר, חתימה, ניווט ממוספר, סימן מילים "Bridgify" זוהר |

**כללי קצב:**
- לא שמים שני סקשני קרם "גדולים" ברצף, אלא אם הם קצרים וממשיכים זה את זה (Partners → FAQ).
- סקשן כהה מגיע עם איור או דמו. סקשן קרם — עם טקסט, גריד או דמו בהיר.

## 5. צבע

### ליבה

| תפקיד | ערך | איפה ב־V2 |
| --- | --- | --- |
| Cream | `#EEE9DE` | רקע סקשני קרם; טקסט ראשי על כהה |
| Deep brown | `#180F10` | רקע ההירו; טקסט ראשי על קרם |
| Coral | `#F46649` | מסגרות, אייקונים, נקודות, קישורים על כהה, פוקוס |
| Warm white | `#FFF8F1` | טקסט על כפתורים, נקודות דאטה זוהרות |

### משטחים כהים (כולם חומים־חמים, אף פעם לא כחולים)

| משטח | ערך |
| --- | --- |
| הירו | `#180F10` |
| Opportunity | `#100A08` |
| Why | `#100C08` |
| Products | `#100D0E` |
| Enterprise | `#120C0A` |
| פוטר | `#160F0D` |

מעברים בין סקשנים כהים: דהייה רכה (`.brand-section-fade`), בלי פסים.

### דיו קורל — `.v2-ink` (המילים המודגשות בכותרות)

- **על כהה:** גרדיאנט `110deg`:
  - `#F46649 0%` → `#FF967B 23%` → `#FFE2C6 43%` → `#F88B72 60%` → `#F46649 78%` → `#FFB49A 100%`
  - צבע גיבוי `#F48B73`
- **על קרם:** `#CF3F25 0%` → `#E5573A 30%` → `#E8603F 50%` → `#D9482C 72%` → `#CF3F25 100%`, צבע גיבוי `#D9482C`.
- **תנועה:** הגרדיאנט נע (`background-size:240%`, 5s, ease-in-out, alternate). נעצר כשההירו בהשהיה וב־reduced motion.
- **תווית סקשן** (eyebrow): על כהה `#FFD8BD → #FFB194 → #F46649`; על קרם `#A63D29 → #CF5035 → #B7412D`.

### טקסט משני

| רקע | ערכים |
| --- | --- |
| על כהה | `#D7C9BD` (שורת הוכחה), `#DED2C1` (טאבים), `#C7B5A5` (אייקונים רגועים), `#CBB6A6` (אותיות קטנות בפוטר) |
| על קרם | `#786B64` (תוויות מונים), `#695951` (פסקת לוואי), `#544440` (מבוא), `#75625C` (תשובות FAQ) |

### קווים ומסגרות

| שימוש | ערך |
| --- | --- |
| קו הפרדה על קרם | `rgba(24,15,16,.15)` |
| קו הפרדה על כהה | `rgba(178,138,104,.18)` |
| פאנל ניטרלי על כהה | `#EEE9DE2E` |
| פאנל מודגש על כהה | `#F4664960` |
| מסגרת רכיב פעיל | קורל מלא `#F46649` |
| מסגרת header | `rgba(244,102,73,.32)` |

### מצב Live

ירוק (`#63D99A`, `#76D9A4`, `#A0EDC2`) רק במצב "החנות באוויר" של Marketplace, כתאורה מלאה. אסור כצבע מותג.

## 6. טיפוגרפיה

שתי משפחות, מקומיות:
- **Chillax** לכותרות ולמספרים: `Chillax_Complete/`, בעיקר Light 300; גם 400 ו־500 בתפקידים מוגדרים.
- **Sofia Sans** לטקסט ולממשק: `Sofia_Sans/`, טווח משקלים 100–900, ובקוד שם המשפחה `Sofia`.

הטוקנים נמצאים ב־`brand-typography.css` והפירוט ב־`TYPOGRAPHY.md`.

| תפקיד ב־V2 | דוגמה | דסקטופ (נמדד ב־1440) | מובייל (390) | משפחה / משקל | גובה שורה | ריווח |
| --- | --- | --- | --- | --- | --- | --- |
| Hero | “One connection…” | `--type-hero` = 51.8px | 34.3px | Chillax 300 | 1.16 | −0.025em |
| כותרת סקשן | “Three products. One connected layer.” | `--type-section` = 41.8px | 28.1px | Chillax 300 | 1.20 | −0.025em |
| כותרת פאנל / שלב | “Building it yourself:”, “Aggregate” | `clamp(23px,1.8vw,32px)` = 25.9–32.4px | — | Chillax 300 | 1.25 | −0.025em |
| כותרת כרטיס קהל | “OTAs” | 28px | 24px | Chillax 400 | 1.18 | −0.025em |
| Lead במוצר | “The full catalog inside your own product…” | `--type-card` = 24.5px | — | Chillax 300 | 1.38 | −0.025em |
| מספר במונה | “1M+”, “180+” | 43.2px | 32px | Chillax 500 | 1.10 | −1.8px |
| מדד ענק | “3×” | ~188px | 122px | Chillax 300 | 0.94 | −0.045em |
| שם לקוח (סימן מילים) | “Isracard” | 37.4px | — | Chillax 500 | 1.2 | −0.025em |
| פסקת לוואי | טקסט בסקשן | 17–18.7px | 17–18px | Sofia 400 | 1.55–1.6 | normal / −0.3px |
| גוף ההירו | “Bridgify, part of HBX Group…” | 16.3px | 18px | Sofia 400 | 1.5 | −0.3px |
| שאלת FAQ | “What is Bridgify?” | 22px | 20px | Sofia 500 | 1.4 | normal |
| כפתור ראשי | “Book a demo ↗” | 15–18px | 17px | Sofia 550 | 1.2 | normal |
| קישור טקסט | “Meet AIyelet ↗” | 14–20px | — | Sofia 400–600 | — | normal |
| תווית סקשן | “PRODUCTS” | 12px | 11px | Sofia 550, UPPERCASE | 1.4 | 0.16em |
| כותרת קבוצה בפוטר | “01 PRODUCTS” | 12px | — | Sofia 500, UPPERCASE | 1.5 | 0.18em |
| שורת הוכחה | “Part of HBX Group · 1M+ experiences · 180+ countries” | 14px | — | Sofia 400 | 1.5 | 0.06em |
| ניווט | “PRODUCTS” | 12px | 15px בתפריט | Sofia 550, UPPERCASE | 1.3 | 1px |

**כללים:**
- Chillax 300 לכותרות. 400 רק לכותרות של כרטיסים קטנים. 500 רק למספרים ולסימני מילים. אין Bold מזויף.
- היררכיה לפי תפקיד, לא לפי תגית. h2 בתוך דמו־דפדפן אינו כותרת סקשן.
- טקסט בתוך איורים ודמואים נשאר בסקאלה היחסית שלו (`cqw` / `--u`), מחוץ לסולם.
- גוף ו־CTA לא קטנים מ־16px במובייל. מיקרו־טקסט דקורטיבי בדמו יכול להיות קטן יותר.
- שבירות שורה לפי משמעות. החלק המודגש בצבע מתחיל לרוב בשורה משלו, או בסוף שורה ("Give them / *the right book.*").

## 7. לוגו

| נכס | קובץ | שימוש |
| --- | --- | --- |
| סמל ניווט — תמנון מעגלים | `assets/bridgify-nav-mark.svg` | ניווט V2 ועמודים פנימיים, בלבן, רוחב 40px, דרך `mask` |
| סמל שטוח | `assets/bridgify-flat-symbol.svg` | לוקאפ V1 |
| לוגו קורל | `assets/bridgify-logo-coral.svg` | שימושים מוצריים |
| תמנון הירו / אייקון | `assets/bridgify-octopus-hero.svg`, `assets/bridgify-octopus-icon.svg` | איור ופביקון |
| סימן מילים בפוטר | `assets/footer-wordmark-reference.png` (מקור: `footer-wordmark-source.md`) | "Bridgify" תלת־ממדי זוהר בתחתית הפוטר |

- **לוקאפ:** סמל + “Bridgify”. ב־header של V2 הסמל לבן והשם בקרם.
- **שורת השייכות:** “Part of HBX Group” מופיעה בשורת ההוכחה של ההירו ומתחת לסימן המילים בפוטר.
- משתמשים רק בנכסים המאושרים וביחסים שלהם. V1 שומר את הסמל המקורי.

## 8. פריסה וגריד (V2)

- **שוליים:** `--home-gutter: calc(3vw + 10px)` — 53px ב־1440. עד 700px: 24px. רוחב התוכן ב־1440: 1334px.
- **קו התחלה אחד:** תווית, כותרת, גוף, כפתור וגריד מתחילים מאותו קו שמאלי (x=53 ב־1440, x=24 במובייל).
- **פיצול כותרת/מבוא:** כותרת הסקשן משמאל (עד ~55% מהרוחב), ומבוא או קישור מימין, מיושרים לראש הכותרת (Personalization, Audiences).
- **ריווח אנכי:** 64–96px בסקשני קרם (`#sources` 64px, `#personalization` 72px, `#audiences` ו־`#faq` 80px, `#partners` 88/96px). סקשני במה כהים נשלטים בגובה המסך.
- **גרידים עם קווי הפרדה:** מונים, קהלים, לקוחות ו־FAQ בנויים מתאים שמופרדים בקו 1px, בלי רקע לתא. זה הדפוס של V2 לתוכן בקרם.
- **רדיוסים:** 5px (ריבוע חץ), 6px (צ'יפים קטנים), 8px (BOOK A DEMO בניווט), 11px (כפתורים, טאב פעיל), 12px (במת מוצר), 13px (אריח אייקון), 14px (header, פאנל השוואה), 19px (כרטיס מדד), 22px (פאנל דמו בהיר), 30px (פוטר).
- **header:** צף, `absolute`, 16px מראש המסך, רוחב מלא פחות 3.2% מכל צד, גובה 78px, פינות 14px. מובייל: 12px מהצדדים, שתי שורות, גובה 123px.
- **נקודות שבירה:** 760px (המעבר הראשי), 900/901px (שני טורים ← טור אחד), 1100px, 850px (ה־header עובר לשתי שורות), 700px (השוליים).
- **דיאגרמות:** במה עם container units (למשל `--u: .125cqw` על 800×760), כדי שהטקסט והקווים יתכווצו ביחס לבמה.
- **גובה מסך:** `min-height:100svh` רק כשהתוכן מתאים. לא חותכים תוכן במסכים נמוכים.

## 9. רכיבים (כפי שהם ב־V2)

### Header
- **רקע:** זכוכית שקופה, `linear-gradient(110deg, #EEE9DE09, #52251D19)`, עם מסגרת קורל 32%.
- **סידור:** לוגו | PRODUCTS · SOLUTIONS · DEVELOPERS · RESOURCES · COMPANY | **LOG IN** · **BOOK A DEMO ↗**.
- **LOG IN:** בסגנון `.brand-action` — גרדיאנט כהה, מסגרת קורל, פינות 11px, גובה 44px, Sofia 550 12px.
- **BOOK A DEMO ↗:** כפתור קרם מלא — רקע `#E9E5DB`, טקסט `#141511`, פינות 8px, ריפוד 15/18px, 12px, ריווח 0.8px. הוא ההנעה הראשית לפעולה בניווט, ולכן הוא הכפתור הבהיר היחיד ב־header.
- **תפריטים נפתחים** (`details.site-nav-group`): פתיחה 300ms ב־`cubic-bezier(.22,1,.36,1)`, מ־`translateY(-10px) scale(.985)`; סגירה 170ms. חץ קורל קטן ליד כל קבוצה.

### כפתור ראשי — `.brand-action`
- **מנוחה:** `linear-gradient(135deg, #513029, #241718)`, טקסט `#FFF8F1`, מסגרת 1px `#F46649`, פינות 11px, צל `inset 0 1px 1px #FFB19455, 0 5px 18px #180F1020`, Sofia 550.
- **Hover/Focus:** מעבר צבע של 0.48s ב־`cubic-bezier(.16,1,.3,1)` לגרדיאנט `#FF9862 → #F46649` (105°), טקסט `#180F10`, הילה קורל.
- **גדלים:** הירו 18px עם ריפוד 15/22 וגובה 54; פוטר 17px עם ריפוד 14/20 וגובה 54; סקשן 15px עם ריפוד 12/14/12/20 וגובה 56.
- **גרסה עם חץ בריבוע** (סקשן Sources): ריבוע קורל 30×30, פינות 5px, ובתוכו ↗ בצבע `#180F10`.

### קישורי טקסט
| הקשר | סגנון |
| --- | --- |
| משני בהירו (על כהה) | “See how it works ↘” — Sofia 500, 17px, קרם, בלי קו |
| על קרם | “Meet AIyelet ↗” — Sofia 600, 16px, `#B64A34`, קו תחתון בהיסט 5px |
| בתוך מוצר (על כהה) | “Explore the Experiences API →” — Sofia 400, 20px, קורל, קו תחתון בהיסט 5px |
| בכרטיס קהל | “Experiences for OTAs ↗” — Sofia 400, 14px, קורל, צמוד לפינה הימנית התחתונה |
| הרחבת טקסט | “Read more +” — קורל |

### תווית סקשן — `.brand-section-label`
נקודה 7px בגרדיאנט `#FFB194 → #F46649` עם זוהר, ואחריה טקסט UPPERCASE: Sofia 550, 12px, ריווח 0.16em, בדיו קורל. על קרם משתמשים ב־`.brand-label-light`. התווית יושבת מעל הכותרת, על אותו קו שמאלי.

### כותרת עם דיו
`<h2>Three products. One <em class="v2-ink">connected layer.</em></h2>` — ראו סעיף 5.

### רצועת מונים (`#sources`)
- **מבנה:** כותרת קטנה (Chillax 500, 28.8px) ואחריה 5 תאים עם קו הפרדה שמאלי `rgba(24,15,16,.15)`.
- **תא:** מספר ב־Chillax 500, 43px, שמתגלגל לערכו הסופי בכניסה (`supply-count-v2.js`), ותווית ב־Sofia, 16px, `#786B64`.
- **תחתית:** קו הפרדה מלא, משפט מסכם, כפתור עם חץ בריבוע, והערת מקור קטנה.

### פאנלי השוואה (`.v2c-panel`)
- **ניטרלי** (“Building it yourself:”): מסגרת `#EEE9DE2E`, פינות 14px, רקע `linear-gradient(125deg, #EEE9DE04, #211A181C)`.
- **מודגש** (“With Bridgify:”): מסגרת `#F4664960`, רקע `linear-gradient(125deg, #3C0C052B, #21080555)`, כותרת בקורל.
- **תוכן:** כותרת Chillax 300, איור, ושלוש שורות עם אייקון קו (קרם בצד הניטרלי, קורל בצד המודגש) וקו הפרדה ביניהן.
- **פס מסקנה מעל הפאנלים:** “Bridgify does the connecting once, for every partner.” — מסגרת קורל, פינות 14px, ו־“+” בצד.

### טאבים נעוצים (`.opx-tabs`, Why Bridgify)
- **מבנה:** רשימה אנכית של 4 שלבים, כל אחד עם אייקון קו. מנוחה: שקוף עם קו תחתון `#C3A98A3B`.
- **פעיל:** רקע `linear-gradient(125deg, #A75E3726, #20140D66)`, מסגרת `#EF995A66`, פינות 11px, צל `-3px 0 14px #F47B3522`.
- **התנהגות:** הטקסט של כל שלב מתחלף משמאל, והבמה מימין מתחלפת בגלילה.

### אקורדיון מוצרים (`.v2p-item`)
- **שורה:** אריח אייקון 56×56 (פינות 13px, מסגרת קורל, אייקון קו), שם המוצר ב־Chillax 300, שורת משנה ב־Sofia, ו־+/− מימין. קו הפרדה `rgba(178,138,104,.18)`.
- **פריט פתוח:** פס קורל אנכי משמאל, Lead ב־Chillax 300, פסקה וקישור מוצר.
- **במה מימין** (`.v2p-preview`): מסגרת קורל, פינות 12px, רקע `linear-gradient(135deg, #2C1C1445, #17110F80)`. מתחלפת לפי המוצר.
- **ניווט:** “Scroll to explore ↓” ומונה “01 / 03”.

### פאנל דמו בהיר (AIyelet, על קרם)
- **פאנל** (`.intent-stage`): גרדיאנט `125deg` מלבן חם שקוף־למחצה לאפרסק, מסגרת `rgba(244,102,73,.32)`, פינות 22px.
- **בתוכו:** משפט ענק ב־Chillax 300 עם מילה מסומנת בצ'יפ קורל, וקו קורל שמחבר אותה לכרטיס “INTENT”.
- **לצד הדמו:** תווית “Illustrative intent example” וכפתור Pause כהה קטן.

### כרטיסי קהל (`.audience-card`)
- **גריד:** 3×2 עם קווי הפרדה 1px `rgba(24,15,16,.15)` וריפוד 30/32px, בלי רקע.
- **תוכן התא:** אייקון קו קורל 56px, כותרת Chillax 400 28px, משפט אחד, וקישור קורל קטן בפינה הימנית התחתונה.

### כרטיס מדד (Enterprise)
- **כרטיס** (`.v2e-proof`): מסגרת קורל, פינות ~19px, רקע `linear-gradient(125deg, #211514, #22120F)`, נקודת סטטוס קורל 7px בפינה.
- **תוכן:** מספר ענק ב־Chillax 300 (“3×”), גריד נקודות שבו כמה נקודות קורל דולקות, ותווית ב־Sofia.

### לקוחות (`#partners`)
שורת תאים עם קווי הפרדה, ובכל תא שם הלקוח כסימן מילים ב־Chillax 500, 37px, בצבע `#180F10`. לוגו אמיתי רק כשהוא מאושר.

### FAQ
`details` עם קו עליון `rgba(24,15,16,.15)` וריפוד 22px. השאלה ב־Sofia 500, 22px, עם ▶. התשובה ב־Sofia 400, 17px, `#75625C`.

### פוטר משותף
- **מעטפת:** `.bf-footer-shell` על `#160F0D`. הכרטיס: פינות 30px, מסגרת `#AA604647`, הילה חמה בתחתית.
- **תוכן מלמעלה למטה:**
  - CTA חוזר: “Tell us who your customers are. *We'll show you what they'd book.*” + Book a demo → / Read the API docs →
  - חתימה
  - ניווט ממוספר 01–05 (המספרים בקורל)
  - סימן המילים "Bridgify" הזוהר
  - “Part of HBX Group”
- **עריכה:** משנים רק ב־`partials/`, ואז מריצים `python3 scripts/sync-footer.py` (ולפני פרסום `--check`).

### בקרות דמו
שורה קטנה מתחת לאיור: “Illustrative product preview” · “Replay ↺” · “Pause animation ⏸” (Sofia, ~12px). כל דמו מונפש חייב את שלושתם, או לפחות תווית + Pause.

### טופס (Login)
`login.html` הוא התבנית לטפסים:
- **שדות:** תווית קבועה מעל כל שדה; `autocomplete` נכון.
- **שגיאות:** מתחת לשדה, עם `aria-invalid` ו־`aria-describedby`, והפוקוס עובר לשגיאה הראשונה.
- **הודעת מצב:** `role="alert"`.
- **שליחה:** מצב busy.
- **מראה:** כרטיס זכוכית עם מסגרת קורל.

## 10. איור וחומר — אוצר המילים של V2

**התוכן מכתיב את האיור.** לפני העיצוב מנסחים במשפט אחד מה המבקר צריך להבין. לכל חיבור, שכבה או אובייקט יש תפקיד בהסבר.

**אלמנטים חוזרים ב־V2:**

| אלמנט | איך הוא נראה | איפה |
| --- | --- | --- |
| כרטיסי חוויה (מקור) | 12 כרטיסים קטנים (140×40 יחידות): תמונה ריבועית, שם החוויה, וקטגוריה בקורל + מחיר ("Attraction · €39"). קטגוריות: Attraction · Tour · Event · Activity. במצב מפוזר: מוטים, תמונה דהויה, מסגרת אפורה; בסדר: צבע מלא ומסגרת חמה. במסך צר: תמונה + שני פסי תוכן במקום טקסט. התמונות ב־`assets/hero-experiences/` (112px) | הירו |
| כבלים | קווי קורל חלקים שמתכנסים ל"פס" של נקודות, ומשם מסתעפים | הירו, Why, השוואה |
| נקודות דאטה | עיגולים קטנים בלבן חם עם זוהר קורל כפול, נעים לאורך כבלים ו"נושמים" (פולס של 1.8s: גודל 0.72↔1.28 ושקיפות 0.6↔1, כל נקודה בקצב משלה) | הירו, Enterprise |
| נקודות מגע | עיגול קרם עם קו קורל, רק בקצה כבל שנוגע ברכיב (שקעים מעל Bridgify, צומת, ראש מכשיר). מופיעה יחד עם הכבל שלה | הירו |
| מכשירים | טלפון, מחשב נייד וטאבלט עם קצה קורל זוהר ומסך כהה, שנדלקים | הירו, Distribute |
| מוקאפים של ממשק | כרטיסי חוויה עם צילום תיירות חם (קולוסיאום, לובר, פריז, שייט), פינות מעוגלות, כפתור קורל | Why, Products |
| סכמה אחת | שלושה מקורות שמתמזגים לרשומה אחת ("Bridgify · One schema") | Normalize |
| שכבות זכוכית | משטחים חצי־שקופים בפרספקטיבה, עם קו גל קורל ונקודות זוהרות | Enterprise |
| גריד נקודות | מטריצת נקודות עדינה, וכמה דולקות בקורל | כרטיס מדד, רקעים |
| קטלוג נשפך | אריחי צילום בתלת־ממד שנשפכים אל הצופה | Products · API |

**כללי חומר:**
- **כבלים:** בקורל, במסלולים חלקים ומכוונים, עם מעט פניות. לא חוצים טקסט.
- **נקודות:** עגולות (r≈3) — לא מקפים או קפסולות. אין נקודה שלא יושבת על כבל או בקצה שלו. `brand-consistency.js` מוסיף נקודות מגע אוטומטית לקצות כבלים; ב־SVG שהכבלים שלו זזים מוסיפים `data-wire-contacts="off"` ומציירים את נקודות המגע בקוד של האנימציה, אחרת נשארות נקודות "יתומות" במקום הישן.
- **רצפה אטומה:** כל משטח זכוכית יושב על רצפה אטומה, כדי שכרטיסים שזזים יסתירו נכון. בעמודים הפנימיים — טוקני `brand-material.css`:

  | טוקן | תפקיד |
  | --- | --- |
  | `--brand-glass` | שכבת הזכוכית העליונה |
  | `--brand-inner` | זכוכית לרכיבים פנימיים |
  | `--brand-floor` | הרצפה האטומה |
  | `--brand-edge` | המסגרת המוארת |
  | `--brand-bevel` / `--brand-inner-bevel` | פאזה פנימית וצל מגע |

- **תלת־ממד:** עובי צד קטן, קצה מואר צר, צל מגע והחזר רך. גוף כהה עם קצה קורל, או גוף קרם עם צל חם. תאורה מקומית — בלי ניאון, זהב או אור דרמטי מפינה.
- **צילום:** צילומי תיירות חמים (שקיעה, אור ערב) בתוך מוקאפים ותמונות מוצר. לא כרקע מלא לסקשן, ולא קולאז'.
- **לא בשפה:** גלובוס כברירת מחדל, כחול, לוויינים או כוכבים, אייקונים מלאים או צבעוניים. האייקונים הם קו קורל או קרם, ~1.5px.
- **טכנולוגיה:** HTML/SVG/CSS קודם. Canvas או WebGL (`assets/vendor/three-0.160.1.min.js`) רק כשנדרש. טקסט נשאר חי.

## 11. תנועה

### טוקנים
| שימוש | ערך |
| --- | --- |
| עקומה ראשית (כניסות, כפתורים) | `cubic-bezier(.16,1,.3,1)` |
| תפריטים, מעברים קצרים | `cubic-bezier(.22,1,.36,1)` |
| יציאה | `cubic-bezier(.4,0,1,1)` |
| מעבר צבע של כפתור | 0.48s |
| תפריט: פתיחה / סגירה | 300ms / 170ms |
| כניסת טקסט בהירו | 750ms, השהיה מדורגת של 100ms, `translateY(20px)` → 0 |
| כניסת חלקי סקשן | 600–1000ms, היסט 24–56px, השהיה מדורגת של 25–35ms |
| זרימת דיו קורל | 5s, alternate |

### הדפוסים של V2
- **מסלול זמן של ההירו** (`hero-funnel-v2.js`):
  0. התנועה מתחילה כבר בפריים הראשון אחרי הטעינה: השעון מתחיל ב־0.6s, כך שהכרטיסים המפוזרים כבר נעים.
  1. כרטיסי החוויות המפוזרים מתכנסים לגריד (מ־1.1s, 2s לכל כרטיס, 55ms בין כרטיסים).
  2. כבל ראשי (4.3s).
  3. הסתעפויות (5s).
  4. המכשירים נדלקים בזה אחר זה (5.5 / 6.4 / 7.3s).
  5. מ־9.3s נקודות זורמות בלולאה.

  יש Replay ו־Pause. ההירו לא רץ כשהוא מחוץ למסך או כשהלשונית מוסתרת. שעון rAF מצטבר, וחלקים עם `data-at` מקבלים `.is-on`.
- **חשיפה חלק אחר חלק:** כל סקשן נפתח רק כשמגיעים אליו. תווית ← כותרת ← טקסט ← איור, ב־fade והיסט קטן (`homepage-v2.js` + `scroll-entrances.js`).
- **רצף נעוץ** (Why Bridgify): 4 שלבים בגלילה. הטאבים, הטקסט והבמה מתחלפים יחד, והגלילה נשארת טבעית.
- **אקורדיון בגלילה** (Products): הפריט הפעיל מתקדם עם הגלילה (01/03), והבמה מתחלפת.
- **מונים:** המספרים מתגלגלים לערכם בכניסה.
- **דמו מתוסרט** (AIyelet): הקלדה, סימון מילה, קו ל־INTENT, עם Pause.
- **3D ב־CSS:** `transform-style: preserve-3d`. לדעיכה משתמשים ב־`@property --o`, כדי לא לשטח את הסצנה.

### עקרונות
- **רצף:** לכל רצף יש התחלה, מעבר וסיום. אובייקט יכול להמשיך לסקשן הבא או לשנות תפקיד. כל מסר מקבל זמן קריאה.
- **אנימציה:** רק `transform` ו־`opacity`. בלי blur שמשתנה בכל פריים. עבודה כבדה נעצרת מחוץ למסך.
- **בלי לולאות מנותקות** שאין להן קשר רעיוני למסר.
- **Reduced motion, מובייל ו־JS:**
  - **Reduced motion:** הכל קופץ למצב הסופי.
  - **מובייל:** אין תלות ב־hover.
  - **בלי JS:** התוכן גלוי (`scroll-entrances.css` לא מסתיר כלום בלי JS).

## 12. נגישות

- **פוקוס:** תמיד נראה — 2px `#F46649`, היסט 4–5px. בפוטר `#FFAE87`.
- **יעדי מגע:** 44px לפחות.
- **ניגודיות:** AA לגוף טקסט. דיו בגרדיאנט רק על כותרות ותוויות, לא על פסקאות.
- **סמנטיקה:**
  - `aria-label` על ניווט ראשי ועל ניווט הפוטר.
  - `aria-hidden` על חצים ומספרים דקורטיביים.
  - `aria-pressed`, `aria-selected` ו־`aria-current` במקומם.
  - מונים: ערך נגיש נפרד (`.bv2-counter-accessible`).
- **תנועה:** כל דמו מונפש ניתן לעצירה, ו־`prefers-reduced-motion` מכובד בכל רכיב.
- **SEO:** login מסומן `noindex`; ה־canonical מצביע ל־`https://www.bridgify.io/...`.

## 13. עמודים, גרסאות ויישור ל־V2

| כתובת | קובץ | מצב מול V2 |
| --- | --- | --- |
| `/` · `?version=2` | `index-v2.html` | **מקור האמת, וברירת המחדל של האתר** |
| `?version=3` | `index-v2.html` + `data-hero="3"` | V2 עם הירו המגדל האיזומטרי ("Picked for your customer") |
| `?version=1` בלבד | `index.html` | עמוד ייחוס ישן; לא נוגעים בלי בקשה מפורשת |
| `/experiences-api`, `/white-label-marketplace`, `/aiyelet` | `api.html`, `marketplace.html`, `personalization.html` | header זכוכית כמו V2; BOOK A DEMO בניווט כהה (`.brand-action`) ולא קרם |
| `/solutions/*` | `otas`, `airlines`, `hotels`, `loyalty-finance`, `travel-technology`, `super-apps` | חלקם עם header חום אטום (Hotels, Super apps, Loyalty) |
| `/about`, `/developers`, `/blog`, `/careers` | `about-us`, `developers`, `insights`, `careers` | About עם header חום אטום |
| `/contact`, `/newsroom` | `contact.html`, `press.html` | header קרם בהיר `#F7F3EB` — חריגה מ־V2 |
| `/login` | `login.html` | header זכוכית; LOG IN פעיל |

- כל עמוד מזוהה ב־`<body data-copy-page="...">`.
- **ברירת מחדל V2:** כל כתובת בלי `version` נפתחת ב־V2, וכל קישור פנימי שומר את הגרסה של המבקר (2, 3 או 1). זה קורה ב־`homepage-version.js`, ב־`dev.py` וב־redirects של `vercel.json`.
- ההפניות מוגדרות ב־`_redirects` (Netlify ו־`dev.py`) וב־`vercel.json` (Vercel), ושני הקבצים חייבים להישאר מסונכרנים.
- עמודי ניסוי (`*-concept.html`, `journey-*.html`, `solution-preview-*.html`, `archive/`) אינם חלק מהאתר הציבורי.

## 14. יישום ובדיקת איכות

1. **לפני עבודה:** פותחים את V2 ומזהים את הדפוס הקרוב (סעיפים 4 ו־9). קוראים את תוכן הסקשן ואת שכניו.
2. **בחירה:** מטפורה ויזואלית אחת, רקע לפי הקצב (כהה = במה, קרם = נשימה), ותווית + כותרת עם דיו לפי הצורך.
3. **מימוש:** טוקנים ורכיבים קיימים. שינויים ממוקדים, בלי שכבות overrides סותרות, ובלי לגעת בסקשנים לא קשורים.
4. **לפני כל פרסום או העלאה** (כלל קבוע מ־31 באוקטובר 2026), בודקים בדפדפן ב־1440×900 וב־390×844:
   - צבעי מותג ו־Chillax/Sofia
   - יישור לקו השמאלי המשותף וריווח
   - שאין גלילה אופקית
   - קישורים, ושאין שגיאות קונסול
   - מקלדת, מגע ו־reduced motion
5. מריצים `python3 scripts/sync-footer.py --check`.
6. מוסרים צילום מסך וקישור לעמוד שנבדק, ומבחינים בין קונספט ליישום.

## 15. פערים ידועים מול V2

מצב ב־10 בנובמבר 2026. לתקן לכיוון V2, לא להעתיק:

| פער | מצב היום | יעד V2 |
| --- | --- | --- |
| גובה ה־header | 86px (V1, About, API, Marketplace), 92px (שאר הפנימיים) | 78px, 16px מהקצה |
| BOOK A DEMO בניווט הפנימי | כהה (`.brand-action`) | קרם מלא |
| header בהיר | Contact, Press על `#F7F3EB`; הסמל הלבן לא נראה עליו | זכוכית על כהה, או סמל כהה כשה־header בהיר |
| header חום אטום | About, Hotels, Super apps, Loyalty | זכוכית שקופה |
| גודל כותרת הירו | Hotels ו־AIyelet 69px, Developers 57.6px, API 54.7px | `--type-hero` (51.8px ב־1440) |
| צבע שם המותג בלוקאפ בעמודים בהירים | `#FF6B35` | `#F46649` |
| קישור שבור ב־V2 | “Read: what is experiences infrastructure?” מוביל ל־`/articles/infrastructure`, שלא קיים | יעד שקיים |
| Login | `data-auth-endpoint` ריק | חיבור לשרת אמיתי |

## 16. תבנית עבודה קצרה לכל סקשן

- המסר שהמבקר צריך להבין:
- המקום בקצב של V2 (כהה/קרם) והדפוס הקרוב מ־V2:
- תווית, כותרת, והמילים שמקבלות דיו:
- הקומפוזיציה והמוקד הוויזואלי:
- משמעות הכבלים / הנקודות / השכבות:
- מצב התחלתי, מעבר ומצב סופי:
- התנהגות במובייל וללא תנועה:
- איך נבדקה התוצאה בפועל:

התבנית מיועדת לעבודה פנימית. אין צורך לבקש מהמשתמש למלא אותה בכל משימה.

## Shared navigation — latest user direction, 14 November 2026

V2 and all 16 public inner pages use `shared-navigation.css` and `site-header-common`. The header background is transparent on every page; dropdown menus retain the brand dark theme. The header is 78px tall on desktop and 123px in the compact layout; both actions use dark glass. This supersedes the earlier page-specific header and cream demo-button exceptions. V1 and tutorial previews are excluded. Dropdown motion and keyboard handling remain in `bridgify-nav-motion.js`.

Latest body-copy direction: all public V2 and inner-page editorial body/lead text is 16px on desktop and mobile.
