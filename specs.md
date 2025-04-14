WebScore360 MVP - Detailed Specifications

1. Goal: Launch a functional MVP that analyzes a website homepage, generates a score and basic category insights, delivers a PDF report via email, and provides a simple dashboard accessible via Google Sign-in, with clear upgrade paths.

2. Core Technology Stack:
*   Frontend: Next.js
*   Backend: Supabase (Authentication, Database), Render Background Worker (Node.js for Analysis)
*   Message Queue: Redis (e.g., Render Add-on or managed service)
*   PDF Generation: Node.js library (e.g., Puppeteer for rendering HTML to PDF, or pdf-lib)
*   External APIs: Google PageSpeed Insights API

3. Analysis Engine & Scoring (v1 - Simplified):


    Overall WebScore (0-100): Calculated as an equal average of the 5 category scores.
        WebScore = (Performance + SEO + Conversion + Branding + Presence) / 5

    Category Scores (0-100 each): Each category score is calculated based on simple checks, normalized to 100.

    Traffic Light System Thresholds (Applied to Overall & Category Scores):
        Red: 0 – 49 (Urgent attention needed)
        Yellow: 50 – 79 (Room for improvement)
        Green: 80 – 100 (Generally well-optimized)

    Specific Checks (Homepage Only for MVP):
        A. Website Performance (20% Weight):
            Page Speed (Mobile): Directly use the 0-100 mobile score from Google PageSpeed Insights API. (Score contributes directly)
            HTTPS Security: Pass (100) if URL resolves to https:// with a valid certificate (simple check), Fail (0) otherwise.
            Category Score Logic: (PageSpeed Score * 0.7) + (HTTPS Score * 0.3)
        B. SEO Health (20% Weight): (5 checks, 20 points each -> normalized to 100)
            Title Tag: Pass (100) if <title> tag exists and is not empty, Fail (0) otherwise.
            Meta Description: Pass (100) if <meta name="description"> exists and has content, Fail (0) otherwise.
            H1 Heading: Pass (100) if exactly one <h1> tag exists, Fail (0) otherwise.
            Image Alt Text: Pass (100) if >= 80% of <img> tags have a non-empty alt attribute, Fail (0) otherwise.
            Sitemap: Pass (100) if /sitemap.xml returns a 200 OK status (HEAD request), Fail (0) otherwise.
            Category Score Logic: Average of the 5 check scores.
        C. Conversion Readiness (20% Weight): (3 checks, ~33.3 points each -> normalized to 100)
            CTA Presence: Pass (100) if at least one <button> or link <a> with common CTA text (e.g., "Learn More", "Contact", "Shop", "Sign Up", "Book Now") is found, Fail (0) otherwise.
            Form Presence: Pass (100) if at least one <form> tag is found, Fail (0) otherwise.
            Contact Method: Pass (100) if a mailto: link OR a link to a page like /contact is found, Fail (0) otherwise.
            Category Score Logic: Average of the 3 check scores.
        D. Branding Basics (20% Weight): (2 checks, 50 points each -> normalized to 100)
            Logo Presence: Pass (100) if an <img> tag likely representing a logo is found in the header/top section (heuristic check based on common class names, IDs, or 'logo' in src/alt), Fail (0) otherwise.
            Professional Domain: Pass (100) if the domain is NOT from a known free subdomain platform (e.g., wordpress.com, blogspot.com, etc.), Fail (0) otherwise.
            Category Score Logic: Average of the 2 check scores.
        E. Online Presence Snapshot (20% Weight): (2 checks, 50 points each -> normalized to 100)
            Social Media Links: Pass (100) if links to >= 2 common platforms (Facebook, Instagram, LinkedIn, Twitter) are found, Partial (50) if 1 link found, Fail (0) if none found.
            Google Business Profile Link: Pass (100) if a link containing maps.google.com or google.com/search?q= (indicating a potential GBP link) is found, Fail (0) otherwise.
            Category Score Logic: Average of the 2 check scores.


4. PDF Report (v1 - Simple):


    Generation: Triggered by the Analysis Worker after scoring.

    Content:
        Clean, professional template using WebScore360 branding (logo, muted colors).
        Page 1: Cover - Logo, Tagline, Website URL Audited, Date.
        Page 2: Summary - Overall WebScore (large, color-coded R/Y/G), brief interpretation paragraph. List of the 5 Category Scores with their R/Y/G color indicators.
        Page 3+: Optional for MVP, could defer - One page per category showing the Pass/Fail result for each check within that category.
        Final Page: Call-to-Action: "Log in to your dashboard for detailed explanations and step-by-step fixes!" Link to the app's login page. Footer with company name/website.

    Delivery: Emailed automatically to the user's submitted email address as an attachment.


5. Fix-It Guidance (v1 - Generic Content):


    Content: For each specific check (e.g., "Missing Title Tag", "Low PageSpeed Score"), provide pre-written, generic text covering:
        What it is: Simple explanation.
        Why it matters: Briefly explain the benefit of fixing it (SEO, User Experience, Conversion).
        How to fix it: General, actionable steps suitable for a non-technical small business owner (e.g., "Log into your website editor...", "Look for the SEO settings...", "Compress images using a tool like TinyPNG...").

    "Let us fix it for you" Button: Simple mailto: link opening the user's email client, pre-filled with:
        To: support@yourdomain.com (Replace with actual desired support email)
        Subject: Help Needed with [Issue Name] for [User's Website URL] (e.g., "Help Needed with Missing Title Tag for example.com")
        Body: "Hi WebScore360 team, I need help fixing the following issue identified in my report:\n\nIssue: [Issue Name]\nWebsite: [User's Website URL]\n\nPlease let me know about your 'Done-for-you' service options.\n\nThanks,"


6. User Flow & Dashboard (v1 - Core Access):


    Landing Page: User enters Website URL and Email -> Clicks "Get My Score".

    Processing: Frontend shows a "Generating your report..." message. Backend API receives request, validates, creates initial record, pushes job to Redis queue.

    Worker: Render worker picks up job, performs analysis, calls PageSpeed API, calculates scores, saves results to Supabase DB (linked to email/URL), generates PDF, emails PDF using a transactional email service (e.g., SendGrid via Supabase).

    Email Received: User gets the PDF report. Email includes a prominent call-to-action button/link: "View Detailed Report & Fixes -> Login/Sign Up".

    Login/Sign Up: Clicking the link takes the user to a Supabase-powered login page. Only Google Sign-In option is presented for MVP.

    Authentication: User authenticates via Google. Supabase Auth handles this. A new user record is created in the Supabase users table (or linked if email exists). A corresponding profiles table stores app-specific data (like subscription tier).

    Dashboard Access: Upon successful login, the user is redirected to the Next.js dashboard.

    Dashboard Display (Free Tier):
        Shows Overall WebScore & Category Scores (with colors).
        Lists checks performed under each category with Pass/Fail status.
        Hides the detailed "Why it matters" & "How to fix it" text. Shows a "Lock" icon or similar.
        Clicking a locked item displays an "Upgrade to Pro to unlock detailed guidance and fix-it steps" message with an Upgrade button.
        Displays remaining audits for the month (initially 1/1 used). Audit button might be disabled until next month.


7. Subscription Plans & Feature Gating (v1 - Basic):


    Database (Supabase): profiles table linked to auth.users will store subscription_tier ('free', 'pro', 'business_plus'), audits_remaining_this_month, subscription_end_date (for future). audits table stores history.

    Free Plan (Default):
        Max 1 audit per month.
        Dashboard shows scores & check results (pass/fail).
        Fix-It Guidance details are locked.

    Pro Plan ($19/mo):
        Max 30 audits per month.
        Unlocks all Fix-It Guidance details ("What", "Why", "How") in the dashboard.
        Placeholder: Maybe adds a non-functional "Action Tracker" tab for future dev.

    Business+ Plan ($57/mo):
        Unlimited audits per month.
        Includes all Pro features.
        Placeholders: May add non-functional tabs/sections for "Competitor Benchmarks", "Priority Support", "Service Discounts".

    Upgrade Flow: Clicking "Upgrade" buttons initiates the Stripe/Paddle checkout flow (requires integration in Next.js frontend and webhooks handled by a Supabase Edge Function or Render endpoint to update the user's subscription_tier in the DB).

    Annual/LTD: Defer implementation until post-MVP validation.


8. Key Data Models (Supabase - Simplified):


    profiles: (links via UUID to auth.users) id, user_id, email, subscription_tier, audits_remaining, stripe_customer_id (nullable).

    audits: id, user_id (nullable, link if user logged in later), requested_email, website_url, created_at, overall_score, performance_score, seo_score, conversion_score, branding_score, presence_score, report_pdf_url (optional, if stored), raw_data (JSONB, storing check results).


9. Excluded from MVP:


    Email sequences (beyond initial report).

    Detailed keyword analysis.

    Competitor benchmarking functionality.

    Social media audit beyond link presence.

    SEO progress tracking over time (requires storing historical audit details).

    Action Tracker functionality.

    Team access / Agency features / White-labeling.

    AI Assistant.

    Advanced analysis (e.g., checking specific tech stack vulnerabilities, deeper link analysis, brand sentiment).

    Annual or LTD plan implementation.

    Non-Google login methods.

