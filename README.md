# craftworks-v3

**KI-gestützte Plattform zur Prüfung und Optimierung von Handwerkerangeboten**

---

## Projektstruktur

```
craftworks-v3/
  backend/   → Node.js/Express API für Angebotsanalyse & Regel-Engine
  frontend/  → Next.js 13 (TypeScript, Tailwind) für Upload, Bewertung & UI
```

---

## Schnellstart

### Backend starten

```bash
cd backend
npm install
npm run dev
```

### Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Die Frontend-App ist standardmäßig unter [http://localhost:3001](http://localhost:3001) erreichbar  
Das Backend läuft z.B. auf [http://localhost:3000](http://localhost:3000)

---

## Umgebungsvariablen

- **Backend:**  
  `.env` (Beispiel: `.env.example` beachten)

- **Frontend:**  
  `.env.local` (API-URL als `NEXT_PUBLIC_API_URL`)

---

## Hinweise & Best Practices

- `node_modules/`, `.env`, Build-Ordner sind im `.gitignore` ausgeschlossen.
- Nach jedem neuen Clone: in `backend` und `frontend` jeweils `npm install` ausführen.
- Sensible Daten **niemals** ins Repo committen.
- Separate Dokumentation für Backend und Frontend möglich (README in den jeweiligen Ordnern).

---

## Kontakt & Mitarbeit

*Craftworks Team – 2025*

Fragen, Feedback oder Interesse an Zusammenarbeit?  
[Kontaktmöglichkeiten hier einfügen]