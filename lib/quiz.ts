// Source: "Quiz Q&A.docx" supplied by Renata.
export type Question = { q: string; options: string[]; answer: number };

export const QUIZ: Question[] = [
  {
    q: "Bioequivalence primarily compares which characteristics between a test and reference product?",
    options: ["Color and shape", "Rate and extent of absorption", "Packaging and shelf life", "Manufacturing location"],
    answer: 1,
  },
  {
    q: "Which pharmacokinetic parameters are commonly used to assess bioequivalence?",
    options: ["AUC & Cmax", "BMI & BSA", "BP & heart rate", "Creatinine & ALT"],
    answer: 0,
  },
  {
    q: "Which combination correctly represents Renata’s global presence highlighted in the leaflet?",
    options: [
      "22 Global Destinations & 69 Regulated Markets",
      "100 bioequivalent products, 69 Global Destinations & 22 Regulated Markets",
      "100 Global Destinations & 69 Regulated Markets",
      "69 Global Destinations & 100 Regulated Markets",
    ],
    answer: 1,
  },
  {
    q: "Which of the following includes existing bioequivalent products from Renata Oncology?",
    options: [
      "Rosimer, Tyrokin, Sofenib & Pazoren",
      "Rosimer, Renaclib, Sofenib & Pazoren",
      "Renaclib, Tyrokin, Sofenib & Pazoren",
      "Rosimer, Tyrokin, Renaclib & Pazoren",
    ],
    answer: 0,
  },
  {
    q: "Which of the following correctly matches the Renata products highlighted for achieving the f2 value with their generics?",
    options: [
      "Paltab–Eltrombopag & R-Pag–Palbociclib",
      "Paltab–Palbociclib & R-Pag–Eltrombopag",
      "Paltab–Abemaciclib & R-Pag–Imatinib",
      "Paltab–Osimertinib & R-Pag–Sorafenib",
    ],
    answer: 1,
  },
  {
    q: "Which statement correctly identifies Renata’s upcoming bioequivalent brand?",
    options: ["Paltab — Abemaciclib", "R-Pag — Abemaciclib", "Rosimer — Abemaciclib", "Renaclib — Abemaciclib"],
    answer: 3,
  },
];

export const SECONDS_PER_QUESTION = 20;
