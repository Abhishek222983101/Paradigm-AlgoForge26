# CogniStream - AI-Powered Clinical Trial Matching Engine

> Winner - COHERENCE Hackathon 2024 | Team Paradigm

## Overview

CogniStream is an AI-powered clinical trial eligibility engine that reduces patient-to-trial matching time from 30+ minutes to under 15 seconds. Built for the IEEE AlgoForge'26 Hackathon (Health Care & Medtech track).

## Features

- **4-Layer ML Pipeline**: Anonymization → Rule Engine → Semantic Matching → Geo-Filtering
- **HIPAA Compliant**: NER-based anonymization, AES-256 encryption, audit logging
- **Real-time Matching**: Match patients to 30+ clinical trials instantly
- **Explainable AI**: Per-criterion pass/fail reasoning with confidence scores
- **Geographic Intelligence**: Distance-based trial filtering with Google Maps integration

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS (Brutalist UI)
- **Backend**: Next.js API Routes, Python (planned)
- **AI/ML**: Groq LLM, Google Generative AI
- **Data**: 50 synthetic patients, 30 clinical trials from ClinicalTrials.gov

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Abhishek222983101/Paradigm-AlgoForge26.git
cd Paradigm-AlgoForge26
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Add your API keys:
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API
- `GROQ_API_KEY` - Groq LLM API

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── chat/          # AI Chat interface
│   ├── dashboard/     # Coordinator dashboard
│   ├── pipeline/      # 4-step processing pipeline
│   └── results/       # Trial matching results
├── components/ui/     # Reusable UI components
└── lib/               # Core libraries
    ├── clinicalData.ts   # Patient & trial data
    ├── hipaa.ts          # Anonymization & encryption
    ├── ragEngine.ts      # RAG-based AI engine
    └── googleDistance.ts # Distance calculation
```

## Architecture

### 4-Layer Matching Pipeline

1. **Secure Ingestion & Anonymization** - PII detection and redaction
2. **Deterministic Rule Engine** - Age, gender, ECOG, lab values
3. **Semantic Vector Search** - ML-based criteria matching
4. **Geographic Filtering** - Distance-based trial ranking

### Composite Scoring Formula

```
Score = (0.30 × Rule) + (0.20 × Embedding) + (0.35 × LLM) + (0.15 × Geo)
```

## Team Paradigm

Built for IEEE AlgoForge'26 Hackathon

## License

MIT License
