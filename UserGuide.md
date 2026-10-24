# Measuring Learners English Writing - User Guide

A comprehensive linguistic diagnostic tool designed by Oscar Wenzhao He for measuring English learner writing, syntactic complexity, logical connectors, sentence length variation, lexical density, target wordlist marking, indicator statistics, and multi-format CSV / Excel data exports. Follow this guide to get the most out of your linguistic analysis.

## Target Users

This tool is meticulously crafted for professionals, researchers, teachers, and learners involved in English language education, linguistics, and text analysis:

*   **English Language Teachers & Educators (EFL/ESL):** Evaluate student essay complexity, assess mastery of academic transition words, and track syllabus vocabulary usage against target wordlists.
*   **Linguistics & Applied Linguistics Researchers:** Conduct corpus-based studies, second-language (L2) syntactic maturity benchmarks, discourse transition frequencies, and statistical indicator distributions across student cohorts.
*   **Students & English Learners:** Receive automated, actionable diagnostics on sentence variety, connector diversity, and target vocabulary coverage.
*   **Curriculum & Content Developers:** Audit instructional materials, measure reading level difficulty, and verify target vocabulary recurrence across textbook units.

## When to Use This Tool

"Measuring Learners English Writing" shines in scenarios where deep textual understanding, learner diagnostics, and statistical modeling are required:

*   **Descriptive Statistics of Writing Indicators:** Compute rigorous descriptive statistics (Mean, Standard Deviation, Median, Min, Max, and Total Sum) across dozens of linguistic and syntactic indicators for a corpus of learner essays.
*   **Direct CSV Data Export for Research:** Export publication-ready CSV datasets formatted for immediate import into statistical packages such as R, SPSS, Stata, JASP, Jamovi, or Microsoft Excel.
*   **Target Wordlist Marking & Coverage Assessment:** Supply custom vocabulary lists or choose from built-in academic wordlists (e.g., Coxhead's Academic Word List). The tool automatically marks target words in the text and audits usage rates.
*   **Syntactic Complexity Evaluation:** Assess how intricately a text is structured by calculating coordinate/subordinate clauses, subordination ratios, and complex sentence percentages.
*   **Lexical Richness Check:** Determine if a text utilizes a varied vocabulary (Type-Token Ratio) and a high density of information-carrying content words (Lexical Density).
*   **Comparative Corpus Studies:** Use batch analysis to process multiple documents simultaneously to identify patterns across different authors, student cohorts, or revision drafts.
*   **Data Cleaning & Stopword Filtering:** Toggle stopword filtering to isolate meaningful lexical words from grammatical function tokens.

## Statistics of Writing Indicators

The tool performs automated statistical aggregation across all analyzed documents:

*   **Statistical Metrics Computed:**
    *   **Mean (Average):** The arithmetic average of the indicator across all documents in the corpus.
    *   **Standard Deviation (SD):** Measures the dispersion and variability of the indicator across the learner cohort.
    *   **Median:** The central tendency value, robust against outliers and extreme essay lengths.
    *   **Minimum (Min) & Maximum (Max):** The observed range across the cohort.
    *   **Total / Sum:** The cumulative count across the entire corpus for discrete frequency metrics (words, sentences, clauses, connectors, target vocabulary).
*   **Indicator Categories Covered:**
    1.  **Volume & Length:** Total Words, Total Sentences, Mean Sentence Length, Sentence Length SD (Variability), Min/Max/Median Sentence Length, Short/Medium/Long Sentence Ratios.
    2.  **Syntactic Complexity:** Clauses Per Sentence, Subordinate Clauses (Count & Ratio), Coordinate Clauses (Count & Ratio), Complex Sentences (Count & Ratio %), Passive Voice Constructions (Count & Ratio).
    3.  **Logical Connectors & Cohesion:** Total Logical Connectors, Connector Density per 100 Words, Contrast & Concession, Addition & Elaboration, Cause & Effect, Sequence & Progression, Exemplification & Clarification.
    4.  **Lexical Diversity & Sophistication:** Unique Word Types, Type-Token Ratio (TTR), Lexical Density (% content words), Advanced/Polysyllabic Words (>=3 syllables Count & Ratio %), Mean Word Length.
    5.  **Target Wordlist Diagnostics:** Total Matches (Tokens), Wordlist Density %, Unique Types Covered, List Coverage Rate %.
*   **Interactive Indicator Statistics Matrix:** Switch to the **Indicator Statistics** tab in the Batch Analyzer to view the interactive statistics table, complete with category filter pills and key cohort benchmark cards.

## Target Wordlist Marking & Curriculum Evaluation

A key capability of this tool is tracking and marking learner uptake of designated target vocabulary:

*   **Flexible Wordlist Configuration:**
    *   **Curated Academic Presets:** Instant one-click loading of the *Academic Word List (AWL Core)*, *Academic Discourse & Transitions*, and *Critical & Analytical Verbs*.
    *   **Custom Vocabulary Input:** Paste or type custom vocabulary sets separated by commas, spaces, semicolons, or newlines.
    *   **File Import:** Upload existing `.docx`, `.txt`, or `.csv` wordlists directly.
    *   **Inflection-Aware Matching:** Matches base lemmas as well as regular morphological inflections (e.g., *analyze*, *analyzes*, *analyzed*, *analyzing*).
*   **In-Text Visual Marking:**
    *   Switch to **Marked Text** view in the source panel to see all occurrences of target vocabulary highlighted in distinct amber tags with match counts.
*   **Diagnostic Metrics:**
    *   **Target Matches (Tokens):** Total occurrences of target words in the essay.
    *   **Target Word Density (%):** Proportion of target words relative to total essay word count.
    *   **Types Covered:** Number of unique target words from the list utilized by the student.
    *   **List Coverage Rate (%):** Percentage of target curriculum vocabulary successfully incorporated.
    *   **Unmatched Words Inventory:** Identifies target vocabulary words not yet utilized in the draft—ideal for instructor revision prompts.

## Supported Document Formats

The tool natively supports seamless importing of learner texts:
*   **Microsoft Word Documents (`.docx`):** Automatically extracts full essay content without requiring manual conversion or copy-pasting.
*   **Plain Text Files (`.txt`):** Standard UTF-8 text documents.
*   **Drag-and-Drop:** Drag `.docx` or `.txt` files directly into the single editor or the batch dropzone.

## CSV & Excel Export Options

All indicators and statistical aggregations can be exported with a single click:

*   **Batch Analysis CSV Exports:**
    1.  **Indicator Statistics Summary (`Corpus_Indicator_Statistics_Summary.csv`):** Clean, publication-ready table where rows are indicators and columns are Category, Indicator Name, Unit, N, Mean, SD, Median, Min, Max, and Total Sum.
    2.  **All Documents & Statistics (`Corpus_Indicators_And_Statistics.csv`):** Comprehensive dataset with every document as a row, all indicator values, and statistical summary rows (Mean, SD, Median, Min, Max, Sum) appended at the bottom.
    3.  **Target Wordlist Breakdown (`Corpus_Target_Wordlist_Breakdown.csv`):** Document-by-document table containing every target word's presence status, frequency count, density %, matched token forms, and sample sentence contexts.
*   **Single Essay CSV Export:**
    *   **Indicators & Statistics CSV (`[Document]_indicators.csv`):** Detailed CSV of all measured indicators with units and values, along with target wordlist diagnostic hits.
*   **Excel Multi-Sheet Workbooks (`.xlsx`):**
    *   Consolidated spreadsheets containing Corpus Stats, Indicator Statistics Summary, Target Wordlist Breakdown, and Word Frequency tables.

## Application Menus & Navigation (软件菜单与导航系统)

The interface features an intuitive menu bar at the top:

*   **File Menu (文件菜单):**
    *   **Upload Files (Single/Batch):** Seamlessly load individual `.docx` or `.txt` essays into the Single Document Analyzer, or batch upload entire corpora into the Batch Corpus Analyzer.
    *   **Export (CSV/Excel):** Export publication-ready multi-sheet Excel workbooks (`.xlsx`) or statistical CSV datasets (`.csv`) for individual essays or whole corpora.
    *   **Clear All:** Cleanly reset the active document or corpus queue with one click.
*   **References Menu (参考文献与设置菜单):**
    *   **Target Wordlist:** Configure curriculum vocabulary lists, select academic presets (AWL Core, Discourse, Verbs), or import external wordlists.
    *   **Filter Stopwords:** Globally toggle function/grammar word exclusion on or off across lexical frequency tables and analytical metrics.
    *   **User Guide:** Open the complete PDF user guide and methodology documentation.

## Preparation & Workflow

1.  **Prepare Files:** Organize student essays in `.docx` (Microsoft Word) or `.txt` (Plain Text) format for single document evaluation or batch corpus upload.
2.  **Upload via File Menu:** Click **File -> Upload Files** to import your single document or batch corpus. Drag & drop is also natively supported.
3.  **Configure References:** Click **References -> Target Wordlist** to set active target vocabulary, and toggle **References -> Filter Stopwords** as needed.
4.  **Analyze & Inspect:** Review full-width indicator profiles, sentence complexity, clause breakdowns, and target wordlist density. Click **View Document & Marked Words** to view in-text vocabulary highlights.
5.  **Indicator Statistics:** Inspect descriptive statistics (Mean, Median, SD, Min, Max, Sum) for all writing indicators across individual documents or whole corpora.
6.  **Export via File Menu:** Click **File -> Export (CSV/Excel)** to download multi-sheet Excel workbooks (`.xlsx`) or statistical CSV datasets.

## Windows Desktop EXE Compilation & Offline Usage (编译为 Windows 桌面版 EXE)

The software is engineered with a modular Electron 42 and Vite architecture, allowing researchers and teachers to compile and run it as an independent Windows executable (`.exe`):

*   **100% Offline & Private:** Learner writings, exams, and corpus files are processed completely in memory and on local disk without transmission over external networks.
*   **One-Click Build Script:** Double-click `build-windows-exe.bat` on any Windows PC with Node.js installed to automatically build the application.
*   **Compilation Commands:**
    1.  `npm install` - Install dependencies.
    2.  `npm run build:exe` - Builds production React bundle and creates standard Windows installer (`.exe`) in `/release/`.
    3.  `npm run build:exe:dir` - Produces portable unpacked application directory (`release/win-unpacked/Measuring Learners English Writing.exe`).
*   **In-App Assistant:** Click **Windows EXE** in the top navigation bar to download the batch script and view step-by-step compilation guidance.

---
*Designed by Oscar Wenzhao He*
