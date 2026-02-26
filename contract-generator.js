let currentStep = 1;
let contractData = {};

const scenarioForms = {
    freelancer: {
        title: "Freelancer / Consultant Contract",
        subtitle: "Tell us about your project or engagement",
        fields: [
            { label: "Your Full Name *", id: "businessName", type: "text", placeholder: "Jane Doe", required: true },
            { label: "Your Email *", id: "businessEmail", type: "email", placeholder: "jane@example.com", required: true },
            { label: "Client Name / Company *", id: "clientName", type: "text", placeholder: "Acme Corporation", required: true },
            { label: "Client Email *", id: "clientEmail", type: "email", placeholder: "contact@acme.com", required: true },
            { label: "Brief Project/Service Description *", id: "services", type: "textarea", placeholder: "Just give us a brief description - we'll expand it with AI!\n\nExamples:\n• Web development for e-commerce site\n• Marketing strategy consulting for tech startup\n• Logo and brand identity design\n• Business operations consulting", required: true, rows: 3 },
            { label: "Key Deliverables (brief list) *", id: "deliverables", type: "textarea", placeholder: "Just list the main items - we'll add details!\n\nExamples:\n• Website, documentation\n• Strategy document, monthly reports\n• Logo files, brand guidelines", required: true, rows: 3 },
            { label: "Total Project Fee / Monthly Retainer ($) *", id: "price", type: "number", placeholder: "5000", required: true, half: true },
            { label: "Payment Terms *", id: "paymentTerms", type: "select", required: true, half: true, options: ["50% upfront, 50% on completion", "Monthly in advance", "Upon completion", "Net 30"] },
            { label: "Start Date *", id: "startDate", type: "date", required: true, half: true },
            { label: "Timeline/Duration *", id: "timeline", type: "text", placeholder: "6 weeks or 3 months", required: true, half: true }
        ]
    },
    service_business: {
        title: "Service Business Contract",
        subtitle: "Details for your service agreement",
        fields: [
            { label: "Business Name *", id: "businessName", type: "text", placeholder: "CleanPro Services LLC", required: true },
            { label: "Business Email *", id: "businessEmail", type: "email", placeholder: "info@cleanpro.com", required: true },
            { label: "Client Company *", id: "clientName", type: "text", placeholder: "ABC Office Building", required: true },
            { label: "Client Email *", id: "clientEmail", type: "email", placeholder: "facilities@abc.com", required: true },
            { label: "Brief Services Description *", id: "services", type: "textarea", placeholder: "Keep it brief - we'll expand with AI!\n\nExample: Weekly office cleaning", required: true, rows: 2 },
            { label: "Service Frequency *", id: "frequency", type: "select", required: true, half: true, options: ["Daily", "Weekly", "Bi-weekly", "Monthly"] },
            { label: "Monthly Rate ($) *", id: "price", type: "number", placeholder: "1200", required: true, half: true },
            { label: "Contract Length *", id: "contractLength", type: "select", required: true, half: true, options: ["6 months", "1 year", "2 years", "Month-to-month"] },
            { label: "Payment Terms *", id: "paymentTerms", type: "select", required: true, half: true, options: ["Due 1st of month", "Net 15", "Net 30"] }
        ]
    },
    product_seller: {
        title: "Product Sales Agreement",
        subtitle: "Details for your product sale",
        fields: [
            { label: "Your Company/Farm *", id: "businessName", type: "text", placeholder: "Green Valley Farms", required: true },
            { label: "Your Email *", id: "businessEmail", type: "email", placeholder: "sales@greenvalley.com", required: true },
            { label: "Buyer Company *", id: "clientName", type: "text", placeholder: "Fresh Foods Market", required: true },
            { label: "Buyer Email *", id: "clientEmail", type: "email", placeholder: "purchasing@freshfoods.com", required: true },
            { label: "Product Description *", id: "services", type: "textarea", placeholder: "Brief description - we'll add details!\n\nExample: Organic tomatoes, 50 lbs per box", required: true, rows: 2 },
            { label: "Quantity *", id: "quantity", type: "text", placeholder: "100 boxes", required: true, half: true },
            { label: "Price per Unit ($) *", id: "unitPrice", type: "number", placeholder: "45", required: true, half: true },
            { label: "Total Amount ($) *", id: "price", type: "number", placeholder: "4500", required: true, half: true },
            { label: "Delivery Date *", id: "deliveryDate", type: "date", required: true, half: true },
            { label: "Payment Terms *", id: "paymentTerms", type: "select", required: true, options: ["50% deposit, 50% on delivery", "Full payment on delivery", "Net 30"] },
            { label: "Delivery Location *", id: "deliveryLocation", type: "text", placeholder: "Buyer's warehouse", required: true }
        ]
    }
};

function goToStep(step) {
    document.querySelectorAll('.step-section').forEach(el => el.classList.remove('active'));
    document.getElementById('step' + step).classList.add('active');
    currentStep = step;
    updateProgress(step);
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function updateProgress(step) {
    for (let i = 1; i <= 3; i++) {
        const progress = document.getElementById(`progress-${i}`);
        const line = document.getElementById(`line-${i}`);
        
        if (i < step) {
            progress.className = 'w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold';
            progress.innerHTML = '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>';
            if (line) line.className = 'w-16 sm:w-24 h-1 bg-green-500';
        } else if (i === step) {
            progress.className = 'w-10 h-10 gradient-bg rounded-full flex items-center justify-center text-white font-bold';
            progress.textContent = i;
            if (line) line.className = 'w-16 sm:w-24 h-1 bg-indigo-600';
        } else {
            progress.className = 'w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold';
            progress.textContent = i;
            if (line) line.className = 'w-16 sm:w-24 h-1 bg-gray-200';
        }
    }
}

function selectScenario(scenario) {
    contractData.scenario = scenario;
    loadScenarioForm(scenario);
    goToStep(2);
}

function loadScenarioForm(scenario) {
    const config = scenarioForms[scenario];
    document.getElementById('formSubtitle').textContent = config.subtitle;
    
    let html = '';
    let halfCount = 0;
    
    config.fields.forEach((field, idx) => {
        let fieldHTML = '';
        
        if (field.type === 'select') {
            fieldHTML = `
                <div class="${field.half ? '' : 'md:col-span-2'}">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">${field.label}</label>
                    <select id="${field.id}" ${field.required ? 'required' : ''} class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                        ${field.options.map(opt => `<option>${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        } else if (field.type === 'textarea') {
            fieldHTML = `
                <div class="md:col-span-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">${field.label}</label>
                    <textarea id="${field.id}" ${field.required ? 'required' : ''} rows="${field.rows || 3}" placeholder="${field.placeholder || ''}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
            `;
        } else {
            fieldHTML = `
                <div class="${field.half ? '' : 'md:col-span-2'}">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">${field.label}</label>
                    <input type="${field.type}" id="${field.id}" ${field.required ? 'required' : ''} placeholder="${field.placeholder || ''}" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                </div>
            `;
        }
        
        if (idx > 0 && !config.fields[idx-1].half && field.half) {
            html += '<div class="grid md:grid-cols-2 gap-6">' + fieldHTML;
            halfCount = 1;
        } else if (field.half && halfCount === 1) {
            html += fieldHTML + '</div>';
            halfCount = 0;
        } else if (field.half) {
            html += '<div class="grid md:grid-cols-2 gap-6">' + fieldHTML;
            halfCount = 1;
        } else {
            if (halfCount === 1) {
                html += '</div>';
                halfCount = 0;
            }
            html += fieldHTML;
        }
    });
    
    if (halfCount === 1) html += '</div>';
    
    document.getElementById('formFields').innerHTML = '<div class="space-y-6">' + html + '</div>';
}

function hl(text) {
    return `<span class="editable-highlight">${text}</span>`;
}

// Convert newline-separated bullet text into individual <p> tags so each item renders on its own line
function formatBulletList(text) {
    return text.split(/\n\n+/).map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        return `<p style="margin:0 0 10px 0;">${trimmed}</p>`;
    }).filter(Boolean).join('');
}

// ADVANCED SCOPE AMPLIFICATION
function amplifyScope(briefDescription) {
    const lower = briefDescription.toLowerCase();
    
    // Detect project type
    const isWeb = /web|site|app|ecommerce|e-commerce|online|digital|portal|platform/.test(lower);
    const isDesign = /design|logo|brand|graphic|visual|identity|ui|ux/.test(lower);
    const isConsulting = /consult|strateg|advisor|coach|analysis|planning/.test(lower);
    const isMarketing = /market|social|content|seo|campaign|advertis|promotion/.test(lower);
    const isDevelopment = /develop|code|software|program|engineer|build/.test(lower);
    const isWriting = /writ|content|copy|article|blog|documentation/.test(lower);
    
    let amplified = '';
    
    // WEB DEVELOPMENT
    if (isWeb || isDevelopment) {
        amplified = `Contractor agrees to provide comprehensive web development services including:

• <strong>Discovery and Planning:</strong> Requirements gathering, technical specifications documentation, project timeline development, and stakeholder alignment sessions

• <strong>User Experience Design:</strong> User research and persona development, wireframing and prototyping, user flow mapping, and accessibility compliance planning (WCAG 2.1 AA standards)

• <strong>Frontend Development:</strong> Responsive design implementation ensuring optimal display across all devices (desktop, tablet, mobile), cross-browser compatibility testing (Chrome, Firefox, Safari, Edge), modern HTML5/CSS3/JavaScript development following industry best practices

• <strong>Backend Architecture:</strong> Server-side logic and API development, database design and optimization, security implementation (authentication, authorization, data encryption), and integration with third-party services as needed

• <strong>Performance Optimization:</strong> Page load time optimization (target: under 3 seconds), code minification and bundling, image optimization and lazy loading, caching strategy implementation

• <strong>Quality Assurance:</strong> Comprehensive testing across devices and browsers, functionality testing, security vulnerability scanning, and performance benchmarking

• <strong>SEO Foundation:</strong> Search engine optimization setup including meta tags, structured data markup, sitemap generation, and mobile-friendliness optimization

• <strong>Documentation and Training:</strong> Complete technical documentation, content management system training, maintenance guidelines, and handoff documentation for future developers`;
    }
    
    // DESIGN
    else if (isDesign) {
        const isBrand = /brand|identity|logo/.test(lower);
        const isUI = /ui|ux|interface|user/.test(lower);
        
        if (isBrand) {
            amplified = `Contractor agrees to provide comprehensive brand design services including:

• <strong>Brand Discovery:</strong> In-depth discovery sessions to understand company vision, values, target audience, competitive positioning, and long-term brand goals

• <strong>Market Research:</strong> Competitive landscape analysis, target audience research, industry trends evaluation, and brand positioning strategy development

• <strong>Concept Development:</strong> Creation of 3-5 distinct creative directions exploring different visual approaches, mood boards for each direction, and presentation of concepts with strategic rationale

• <strong>Brand Identity Design:</strong> Logo design with multiple variations (primary, secondary, icon-only), color palette development with precise specifications (Pantone, CMYK, RGB, HEX), typography system selection and pairing, and visual style guidelines

• <strong>Brand Applications:</strong> Business card and stationery design, social media templates and profile graphics, presentation template design, and email signature design

• <strong>Brand Guidelines:</strong> Comprehensive brand book documenting logo usage rules, color specifications, typography guidelines, imagery style, dos and don'ts, and application examples

• <strong>Revision and Refinement:</strong> Two rounds of revisions per concept to perfect the selected direction, fine-tuning of all design elements, and stakeholder feedback incorporation

• <strong>File Deliverables:</strong> All logo files in vector formats (AI, EPS, SVG) and raster formats (PNG, JPG) at various sizes, organized file structure with clear naming conventions`;
        } else if (isUI) {
            amplified = `Contractor agrees to provide comprehensive UI/UX design services including:

• <strong>User Research:</strong> User persona development, user journey mapping, competitive analysis, and stakeholder interviews to understand user needs and business goals

• <strong>Information Architecture:</strong> Site map creation, content organization and hierarchy, navigation structure design, and user flow documentation

• <strong>Wireframing:</strong> Low-fidelity wireframes for all key screens/pages, interaction design patterns, content placement and prioritization, and responsive layout planning

• <strong>Visual Design:</strong> High-fidelity mockups with complete visual design, color scheme and typography selection, iconography and visual elements, and design system creation

• <strong>Prototyping:</strong> Interactive prototypes demonstrating user flows, clickable navigation and interactions, animation and transition specifications, and user testing preparation

• <strong>Responsive Design:</strong> Designs for desktop, tablet, and mobile breakpoints, touch-friendly interface elements, and responsive behavior documentation

• <strong>Design System:</strong> Component library with reusable UI elements, style guide with colors, typography, spacing, button styles and states, and form element designs

• <strong>Developer Handoff:</strong> Detailed design specifications, asset export and organization, annotation of interactions and states, and collaboration with development team`;
        } else {
            amplified = `Contractor agrees to provide professional design services including:

• <strong>Discovery Session:</strong> Understanding project goals, target audience, brand personality, and creative direction preferences through collaborative discussion

• <strong>Research and Inspiration:</strong> Market and competitor research to inform design decisions, trend analysis relevant to the industry, and creation of mood boards exploring visual directions

• <strong>Concept Development:</strong> Multiple concept presentations (3-5 initial directions) with rationale for each creative approach, exploration of different styles, colors, and visual treatments

• <strong>Iterative Refinement:</strong> Two revision rounds included per concept, collaborative feedback and fine-tuning process, perfecting details based on stakeholder input

• <strong>Final Design Production:</strong> Final artwork delivered in all required formats (AI, EPS, PNG, SVG, JPG, PDF), files optimized for both print (CMYK, 300dpi) and digital use (RGB, web-optimized)

• <strong>Usage Guidelines:</strong> Comprehensive guidelines documenting proper usage, color specifications with exact values, spacing and sizing requirements, and application examples

• <strong>Asset Organization:</strong> Organized asset library with clear file naming and folder structure, version control for easy file management, editable source files with organized layers`;
        }
    }
    
    // CONSULTING / STRATEGY
    else if (isConsulting) {
        amplified = `Contractor agrees to provide comprehensive consulting services including:

• <strong>Discovery and Assessment:</strong> Comprehensive current state analysis, stakeholder interviews with key decision-makers and team members, documentation review of existing processes and systems, and identification of challenges and opportunities

• <strong>Data Gathering and Research:</strong> Industry analysis and competitive benchmarking, market trends research and evaluation, internal capabilities assessment, and quantitative/qualitative data collection and analysis

• <strong>Strategic Analysis:</strong> SWOT analysis (Strengths, Weaknesses, Opportunities, Threats), gap analysis between current and desired states, root cause analysis of key challenges, and scenario planning for multiple strategic options

• <strong>Recommendation Development:</strong> Strategic recommendations with detailed rationale, prioritization framework for initiatives (impact vs. effort), implementation roadmap with phased approach, and risk assessment with mitigation strategies

• <strong>Implementation Planning:</strong> Detailed action plans with assigned owners and timelines, resource requirements and budget estimates, change management strategy and communication plan, and success metrics and KPI framework

• <strong>Stakeholder Engagement:</strong> Regular progress updates and working sessions, executive presentations with strategic insights, collaborative workshops to build buy-in, and documentation of decisions and next steps

• <strong>Knowledge Transfer:</strong> Training and capability building for internal teams, documentation of processes and methodologies, tools and templates for continued use, and best practices guidelines

• <strong>Ongoing Support:</strong> Regular check-ins to monitor progress, troubleshooting and problem-solving support, course corrections as needed, and measurement of results against established KPIs`;
    }
    
    // MARKETING / CONTENT
    else if (isMarketing) {
        amplified = `Contractor agrees to provide comprehensive marketing services including:

• <strong>Marketing Strategy Development:</strong> Target audience research and buyer persona creation, competitive landscape analysis, positioning and messaging strategy, and channel selection and prioritization

• <strong>Content Strategy:</strong> Content audit of existing materials, editorial calendar development with themes and topics, content types and formats planning (blog posts, videos, infographics, etc.), and SEO keyword research and integration

• <strong>Content Creation:</strong> Professional copywriting for all marketing materials, compelling headlines and calls-to-action, brand voice consistency across channels, and proofreading and editing for quality assurance

• <strong>Campaign Development:</strong> Integrated campaign planning across multiple channels, creative concept development and execution, email marketing campaigns with segmentation, and landing page design and optimization

• <strong>Social Media Management:</strong> Platform-specific content creation and scheduling, community engagement and response management, hashtag strategy and trend monitoring, and social media advertising campaign setup

• <strong>Performance Tracking:</strong> Analytics setup and configuration (Google Analytics, social media insights, etc.), Key performance indicator (KPI) dashboard creation, regular reporting with insights and recommendations, and A/B testing for continuous optimization

• <strong>Marketing Assets:</strong> Brand templates for consistent visual identity, image sourcing and graphic design, video scripts and production coordination, and asset library organization and management

• <strong>Strategy Optimization:</strong> Monthly performance reviews and analysis, data-driven recommendations for improvements, trend analysis and market opportunity identification, and quarterly strategic planning sessions`;
    }
    
    // WRITING / CONTENT
    else if (isWriting) {
        amplified = `Contractor agrees to provide professional writing services including:

• <strong>Content Planning:</strong> Topic research and ideation aligned with target audience needs, content outline and structure development, SEO keyword research and strategic integration, and editorial calendar planning

• <strong>Research and Development:</strong> Thorough subject matter research from credible sources, expert interviews and quotes gathering when applicable, fact-checking and accuracy verification, and competitive content analysis

• <strong>Writing and Composition:</strong> Professional, engaging writing in appropriate tone and style, clear, concise communication tailored to target audience, compelling headlines and subheadings for scannability, and strategic calls-to-action to drive reader engagement

• <strong>SEO Optimization:</strong> Natural keyword integration without keyword stuffing, meta title and description optimization, internal and external linking strategy, and structured content formatting for search engines

• <strong>Editing and Refinement:</strong> Self-editing for clarity, grammar, and flow, fact-checking and source citation, tone and brand voice consistency review, and readability optimization (appropriate reading level)

• <strong>Content Formatting:</strong> Proper heading hierarchy (H1, H2, H3) for structure and SEO, bullet points and numbered lists for scannability, image suggestions and alt text recommendations, and formatting for web or print as specified

• <strong>Revision Process:</strong> Two rounds of revisions included based on feedback, incorporation of client comments and suggestions, final proofreading pass before delivery, and plagiarism check to ensure originality

• <strong>Delivery:</strong> Content delivered in specified format (Google Docs, Word, CMS, etc.), clean, properly formatted final files, source links and references provided, and usage rights transferred upon final payment`;
    }
    
    // GENERIC FALLBACK
    else {
        const hasMultipleWords = briefDescription.split(/\s+/).length > 3;
        const projectType = hasMultipleWords ? briefDescription : 'this project';
        
        amplified = `Contractor agrees to provide professional services for ${projectType}, including:

• <strong>Planning and Discovery:</strong> Initial consultation to understand project goals, requirements, and success criteria, stakeholder interviews and needs assessment, timeline and milestone development, and risk identification and mitigation planning

• <strong>Research and Analysis:</strong> Industry best practices research, competitive analysis and benchmarking, technical feasibility assessment, and resource requirements planning

• <strong>Development and Execution:</strong> Iterative development with regular progress updates, quality assurance and testing throughout the process, stakeholder reviews and feedback incorporation, and adherence to agreed-upon timeline and specifications

• <strong>Deliverables:</strong> High-quality professional outputs meeting all specified requirements, comprehensive documentation including methodology and technical details, organized file delivery with clear naming conventions, and training or handoff sessions as needed

• <strong>Quality Control:</strong> Multiple review checkpoints throughout the project, testing and validation of all deliverables, client review and approval process, and final quality assurance before delivery

• <strong>Communication and Reporting:</strong> Regular status updates and progress reports, proactive communication of any challenges or risks, collaborative problem-solving approach, and documentation of all decisions and changes

• <strong>Post-Delivery Support:</strong> 14-day support period for questions and minor adjustments, knowledge transfer and training on deliverables, documentation for future reference and maintenance`;
    }
    
    return amplified;
}

// ADVANCED DELIVERABLES AMPLIFICATION
function amplifyDeliverables(briefDescription) {
    const items = briefDescription.split(/\n|,|;/).filter(l => l.trim()).map(l => l.trim());
    const lower = briefDescription.toLowerCase();
    
    let deliverables = [];
    
    items.forEach(item => {
        const clean = item.replace(/^[•\-\*\d\.)\s]+/, '').trim();
        if (!clean || clean.length < 3) return;
        
        const itemLower = clean.toLowerCase();
        
        // WEBSITE/WEB APP
        if (/website|web|site|app|portal|platform/.test(itemLower)) {
            deliverables.push(`<strong>Fully Functional ${clean}:</strong> Complete, production-ready website with responsive design (mobile, tablet, desktop), cross-browser compatibility (Chrome, Firefox, Safari, Edge), and optimized performance (sub-3-second load times)`);
            deliverables.push(`<strong>Content Management System:</strong> User-friendly CMS (WordPress, custom, or as specified) with admin dashboard, content editing capabilities, media library, and user role management`);
            deliverables.push(`<strong>Technical Documentation:</strong> Complete setup and deployment guides, codebase documentation, API documentation (if applicable), and maintenance procedures`);
            deliverables.push(`<strong>Source Code Repository:</strong> Complete version-controlled source code with clear commit history, organized file structure, and comprehensive README`);
            deliverables.push(`<strong>Training Materials:</strong> Video tutorials or live training session on content management, user guides for admin functions, and quick reference documentation`);
            deliverables.push(`<strong>Post-Launch Support:</strong> 30 days of bug fixes and technical support, performance monitoring, and assistance with minor content updates`);
        }
        
        // DESIGN DELIVERABLES
        else if (/design|logo|brand|graphic|visual|mockup|prototype/.test(itemLower)) {
            const isLogo = /logo|brand|identity/.test(itemLower);
            const isUI = /ui|ux|interface|mockup|prototype/.test(itemLower);
            
            if (isLogo) {
                deliverables.push(`<strong>${clean}:</strong> Final approved design in full color, black & white, and reverse color variations`);
                deliverables.push(`<strong>Vector Files:</strong> AI (Adobe Illustrator), EPS, and SVG formats for infinite scalability`);
                deliverables.push(`<strong>Raster Files:</strong> High-resolution PNG and JPG files in multiple sizes (favicon, social media, print: 300dpi)`);
                deliverables.push(`<strong>Brand Style Guide:</strong> Professional brand guidelines documenting logo usage rules, clear space requirements, minimum sizes, color specifications (Pantone, CMYK, RGB, HEX), and typography guidelines`);
                deliverables.push(`<strong>Application Examples:</strong> Mockups showing logo on business cards, letterhead, website, social media, and other common applications`);
                deliverables.push(`<strong>Editable Source Files:</strong> Original working files with organized layers and clear naming`);
            } else if (isUI) {
                deliverables.push(`<strong>${clean}:</strong> High-fidelity visual designs for all screens/pages with pixel-perfect detail`);
                deliverables.push(`<strong>Responsive Designs:</strong> Designs for desktop (1920px), tablet (768px), and mobile (375px) breakpoints`);
                deliverables.push(`<strong>Interactive Prototype:</strong> Clickable prototype demonstrating user flows, interactions, and animations using Figma, Adobe XD, or similar`);
                deliverables.push(`<strong>Design System:</strong> Component library with reusable UI elements, style guide with colors, typography, spacing, and icon set`);
                deliverables.push(`<strong>Developer Handoff Package:</strong> Detailed specifications, annotated designs with measurements and interactions, exported assets optimized for development, and style guide documentation`);
            } else {
                deliverables.push(`<strong>${clean}:</strong> Final approved design files in all requested formats`);
                deliverables.push(`<strong>File Formats:</strong> Vector files (AI, EPS, SVG) and high-resolution raster files (PNG, JPG, PDF)`);
                deliverables.push(`<strong>Usage Guidelines:</strong> Documentation of proper usage, color codes, and application examples`);
                deliverables.push(`<strong>Editable Source Files:</strong> Original working files with organized, labeled layers`);
            }
        }
        
        // STRATEGY/CONSULTING DELIVERABLES
        else if (/strateg|plan|roadmap|framework|analysis|report/.test(itemLower)) {
            const isStrategy = /strateg|plan|roadmap/.test(itemLower);
            
            if (isStrategy) {
                deliverables.push(`<strong>${clean}:</strong> Comprehensive written document (25-50 pages) with executive summary, detailed analysis, strategic recommendations, and implementation roadmap`);
                deliverables.push(`<strong>Executive Presentation:</strong> PowerPoint/Keynote deck (15-20 slides) distilling key findings and recommendations for leadership review`);
                deliverables.push(`<strong>Implementation Roadmap:</strong> Detailed action plan with phases, timelines, milestones, resource requirements, and success metrics`);
                deliverables.push(`<strong>Financial Projections:</strong> Budget estimates, ROI analysis, and cost-benefit breakdown for recommended initiatives`);
                deliverables.push(`<strong>KPI Dashboard:</strong> Framework for tracking success with defined metrics, measurement methodology, and reporting templates`);
            } else {
                deliverables.push(`<strong>${clean}:</strong> Detailed analytical report with methodology, findings, data visualizations, and insights`);
                deliverables.push(`<strong>Executive Summary:</strong> 2-3 page overview of key findings and recommendations for quick stakeholder review`);
                deliverables.push(`<strong>Data Visualizations:</strong> Charts, graphs, and infographics presenting key data points and trends`);
                deliverables.push(`<strong>Recommendations Report:</strong> Actionable next steps based on analysis findings with prioritization`);
            }
        }
        
        // MARKETING/CONTENT DELIVERABLES
        else if (/content|copy|article|blog|social|campaign|marketing/.test(itemLower)) {
            const isSocial = /social|instagram|facebook|twitter|linkedin|post/.test(itemLower);
            
            if (isSocial) {
                deliverables.push(`<strong>${clean}:</strong> Complete social media content package with professionally written copy, custom graphics, and scheduling recommendations`);
                deliverables.push(`<strong>Content Calendar:</strong> 30-90 day posting schedule with dates, themes, post copy, and visual concepts`);
                deliverables.push(`<strong>Visual Assets:</strong> Custom-designed graphics sized for each platform (Instagram: 1080x1080, Facebook, Twitter, LinkedIn, etc.)`);
                deliverables.push(`<strong>Hashtag Strategy:</strong> Researched, relevant hashtags for each post to maximize reach and engagement`);
            } else {
                deliverables.push(`<strong>${clean}:</strong> Professionally written, SEO-optimized content (800-1,500 words) with compelling headlines and clear structure`);
                deliverables.push(`<strong>SEO Optimization:</strong> Strategic keyword integration, meta title and description, internal linking suggestions, and alt text for images`);
                deliverables.push(`<strong>Formatted Document:</strong> Content delivered in requested format (Google Docs, Word, or direct CMS upload) with proper heading hierarchy`);
                deliverables.push(`<strong>Image Recommendations:</strong> Suggested visuals with descriptions, stock photo links, or custom graphics as specified`);
            }
        }
        
        // GENERIC/CATCH-ALL
        else {
            const wordCount = clean.split(/\s+/).length;
            if (wordCount <= 3) {
                deliverables.push(`<strong>${clean}:</strong> Professional, high-quality deliverable meeting all specified requirements and industry standards`);
                deliverables.push(`<strong>Multiple Formats:</strong> Delivered in all requested file formats optimized for intended use (digital, print, web, etc.)`);
                deliverables.push(`<strong>Documentation:</strong> Supporting materials, usage guidelines, and best practices documentation`);
            } else {
                deliverables.push(`<strong>${clean}:</strong> Professional deliverable completed to specification with quality assurance review`);
                deliverables.push(`<strong>Final Files:</strong> Delivered in appropriate formats with organized file structure`);
            }
        }
    });
    
    return [...new Set(deliverables)].join('\n\n');
}

function generateContract(e) {
    e.preventDefault();
    
    const config = scenarioForms[contractData.scenario];
    config.fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) contractData[field.id] = el.value;
    });

    goToStep(3);
    
    setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];
        const amplifiedScope = amplifyScope(contractData.services);
        const amplifiedDeliverables = amplifyDeliverables(contractData.deliverables || contractData.services);
        
        let contract = '';
        
        if (contractData.scenario === 'freelancer') {
            contract = generateFreelancerContract(today, amplifiedScope, amplifiedDeliverables);
        } else if (contractData.scenario === 'service_business') {
            contract = generateServiceContract(today, amplifiedScope, amplifiedDeliverables);
        } else if (contractData.scenario === 'product_seller') {
            contract = generateProductContract(today, amplifiedScope, amplifiedDeliverables);
        }
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('contractDisplay').classList.remove('hidden');
        document.getElementById('contractContent').innerHTML = contract;
    }, 2500);
}

function generateFreelancerContract(today, amplifiedScope, amplifiedDeliverables) {
    return `
<h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px;">INDEPENDENT CONTRACTOR AGREEMENT</h1>

<p style="margin-bottom: 20px;">This Independent Contractor Agreement ("Agreement") is entered into as of ${hl(today)} ("Effective Date") by and between:</p>

<p style="margin-bottom: 10px;"><strong>CONTRACTOR:</strong></p>
<p style="margin-bottom: 5px; font-weight: 600;">${hl(contractData.businessName)}</p>
<p style="margin-bottom: 30px;">Email: ${hl(contractData.businessEmail)}</p>

<p style="margin-bottom: 10px;"><strong>CLIENT:</strong></p>
<p style="margin-bottom: 5px; font-weight: 600;">${hl(contractData.clientName)}</p>
<p style="margin-bottom: 30px;">Email: ${hl(contractData.clientEmail)}</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">1. SCOPE OF WORK</h2>

<div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
<p style="margin: 0; color: #1E40AF; font-size: 14px;"><strong>🤖 AI Enhanced</strong> - We expanded your brief description into detailed professional language. Feel free to edit.</p>
</div>

<div style="background: #F3F4F6; padding: 20px; border-left: 4px solid #6366F1; margin-bottom: 20px; line-height: 1.9;">
${formatBulletList(amplifiedScope)}
</div>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">2. DELIVERABLES</h2>

<div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
<p style="margin: 0; color: #1E40AF; font-size: 14px;"><strong>🤖 AI Enhanced</strong> - We detailed your deliverables with professional specifications. Customize as needed.</p>
</div>

<p style="margin-bottom: 15px;">Contractor will deliver the following:</p>
<div style="background: #F3F4F6; padding: 20px; border-left: 4px solid #6366F1; margin-bottom: 20px; line-height: 1.9;">
${formatBulletList(amplifiedDeliverables)}
</div>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">3. PROJECT TIMELINE</h2>
<p style="margin-bottom: 10px;"><strong>Start Date:</strong> ${hl(contractData.startDate)}</p>
<p style="margin-bottom: 10px;"><strong>Estimated Completion:</strong> ${hl(contractData.timeline)}</p>
<p style="margin-bottom: 20px;">Timeline may be adjusted by mutual written agreement. Client-caused delays (late feedback, late materials) will extend deadline proportionately.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">4. COMPENSATION</h2>
<p style="margin-bottom: 20px;">Client agrees to pay Contractor ${hl('$' + contractData.price)} for the Services described in this Agreement.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">5. PAYMENT TERMS</h2>
<p style="margin-bottom: 10px;"><strong>Payment Schedule:</strong> ${hl(contractData.paymentTerms)}</p>
<p style="margin-bottom: 10px;"><strong>Late Payments:</strong> Unpaid invoices are subject to ${hl('1.5%')} per month late fee after ${hl('15')} days.</p>
<p style="margin-bottom: 20px;"><strong>Payment Method:</strong> Via check, ACH, wire transfer, or other method agreed upon by parties.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">6. REVISIONS & CHANGES</h2>
<p style="margin-bottom: 10px;">The project fee includes ${hl('two (2)')} rounds of revisions per deliverable.</p>
<p style="margin-bottom: 10px;">Additional revisions beyond the included rounds will be billed at ${hl('$[hourly rate]')} per hour.</p>
<p style="margin-bottom: 20px;">Scope changes (adding features/deliverables not in original agreement) require a written change order with adjusted timeline and fee.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">7. INTELLECTUAL PROPERTY</h2>
<p style="margin-bottom: 10px;"><strong>Ownership:</strong> Upon receipt of full payment, Client owns all rights, title, and interest in the final deliverables.</p>
<p style="margin-bottom: 10px;"><strong>Portfolio Rights:</strong> Contractor retains the right to display work in portfolio, website, and promotional materials.</p>
<p style="margin-bottom: 10px;"><strong>Pre-existing Materials:</strong> Contractor retains ownership of any pre-existing intellectual property incorporated into deliverables, granting Client a license to use such materials as part of the final work.</p>
<p style="margin-bottom: 20px;"><strong>Third-Party Assets:</strong> Any third-party assets (stock photos, fonts, icons, etc.) remain property of their respective owners and may require separate licensing by Client.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">8. CONFIDENTIALITY</h2>
<p style="margin-bottom: 20px;">Both parties agree to keep confidential any proprietary information, trade secrets, or sensitive business information shared during this engagement. This obligation survives termination for ${hl('three (3) years')}.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">9. INDEPENDENT CONTRACTOR STATUS</h2>
<p style="margin-bottom: 10px;">Contractor is an independent contractor, not an employee, partner, or agent of Client.</p>
<p style="margin-bottom: 10px;">Contractor is responsible for all federal, state, and local taxes, insurance, and benefits.</p>
<p style="margin-bottom: 20px;">Contractor retains the right to control the means and methods of performing the Services, subject to meeting the deliverables and deadlines specified in this Agreement.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">10. TERM & TERMINATION</h2>
<p style="margin-bottom: 10px;">This Agreement begins on the Start Date and continues until all deliverables are completed and accepted, or until terminated by either party.</p>
<p style="margin-bottom: 10px;"><strong>Termination for Convenience:</strong> Either party may terminate this Agreement with ${hl('14 days')} written notice.</p>
<p style="margin-bottom: 10px;"><strong>Upon Termination:</strong> Client pays for all work completed through the termination date. Contractor delivers all work product in its current state.</p>
<p style="margin-bottom: 20px;"><strong>Termination for Cause:</strong> Either party may terminate immediately if the other party materially breaches this Agreement and fails to cure within ${hl('7 days')} of written notice.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">11. WARRANTIES</h2>
<p style="margin-bottom: 10px;"><strong>Contractor Warranties:</strong> Contractor warrants that (a) all work will be performed in a professional, workmanlike manner consistent with industry standards, (b) deliverables will be free from material defects for ${hl('30 days')} after delivery, and (c) Contractor owns or has rights to all materials provided.</p>
<p style="margin-bottom: 20px;"><strong>Client Warranties:</strong> Client warrants that (a) Client has authority to enter this Agreement, (b) all materials provided to Contractor do not infringe on third-party rights, and (c) Client will pay amounts due under this Agreement.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">12. LIMITATION OF LIABILITY</h2>
<p style="margin-bottom: 10px;">Contractor's total liability under this Agreement shall not exceed the total amount paid by Client under this Agreement.</p>
<p style="margin-bottom: 20px;">Neither party is liable for indirect, incidental, consequential, or punitive damages, including lost profits, even if advised of the possibility of such damages.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">13. GENERAL PROVISIONS</h2>
<p style="margin-bottom: 10px;"><strong>Governing Law:</strong> This Agreement is governed by and construed in accordance with the laws of ${hl('[Your State]')}, without regard to conflicts of law principles.</p>
<p style="margin-bottom: 10px;"><strong>Entire Agreement:</strong> This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, understandings, and communications.</p>
<p style="margin-bottom: 10px;"><strong>Amendments:</strong> This Agreement may only be amended by a written document signed by both parties.</p>
<p style="margin-bottom: 10px;"><strong>Assignment:</strong> Neither party may assign this Agreement without the prior written consent of the other party.</p>
<p style="margin-bottom: 20px;"><strong>Severability:</strong> If any provision is found invalid or unenforceable, the remaining provisions continue in full force.</p>

<div style="margin-top: 80px; border-top: 2px solid #E5E7EB; padding-top: 40px;">
    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 40px;">SIGNATURES</h2>
    <p style="margin-bottom: 30px;">By signing below, both parties agree to the terms and conditions outlined in this Agreement.</p>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
        <div>
            <p style="font-weight: bold; margin-bottom: 10px;">CONTRACTOR:</p>
            <p style="font-weight: 600; margin-bottom: 40px;">${hl(contractData.businessName)}</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 8px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666;">Signature</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-top: 30px; width: 150px; margin-bottom: 8px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666;">Date</p>
        </div>
        <div>
            <p style="font-weight: bold; margin-bottom: 10px;">CLIENT:</p>
            <p style="font-weight: 600; margin-bottom: 40px;">${hl(contractData.clientName)}</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 8px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666;">Signature</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-top: 30px; width: 150px; margin-bottom: 8px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666;">Date</p>
        </div>
    </div>
</div>
    `;
}

function generateServiceContract(today, amplifiedScope, amplifiedDeliverables) {
    return `
<h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px;">SERVICE AGREEMENT</h1>

<p style="margin-bottom: 20px;">This Service Agreement ("Agreement") is entered into as of ${hl(today)} by and between:</p>

<p style="margin-bottom: 10px;"><strong>SERVICE PROVIDER:</strong></p>
<p style="margin-bottom: 5px; font-weight: 600;">${hl(contractData.businessName)}</p>
<p style="margin-bottom: 30px;">Email: ${hl(contractData.businessEmail)}</p>

<p style="margin-bottom: 10px;"><strong>CLIENT:</strong></p>
<p style="margin-bottom: 5px; font-weight: 600;">${hl(contractData.clientName)}</p>
<p style="margin-bottom: 30px;">Email: ${hl(contractData.clientEmail)}</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">1. SERVICES</h2>

<div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
<p style="margin: 0; color: #1E40AF; font-size: 14px;"><strong>🤖 AI Enhanced</strong> - Professional service description expanded from your input.</p>
</div>

<div style="background: #F3F4F6; padding: 20px; border-left: 4px solid #6366F1; margin-bottom: 20px; line-height: 1.9;">
${formatBulletList(amplifiedScope)}
</div>

${contractData.frequency ? `<p style="margin-bottom: 20px;"><strong>Service Frequency:</strong> ${hl(contractData.frequency)}</p>` : ''}

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">2. COMPENSATION</h2>
<p style="margin-bottom: 20px;">Client agrees to pay Provider ${hl('$' + contractData.price)} ${contractData.frequency ? 'per ' + contractData.frequency.toLowerCase() : ''} for the services described.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">3. PAYMENT TERMS</h2>
<p style="margin-bottom: 10px;"><strong>Payment Schedule:</strong> ${hl(contractData.paymentTerms)}</p>
<p style="margin-bottom: 20px;"><strong>Late Payments:</strong> Late payments subject to ${hl('1.5%')} monthly fee.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">4. TERM</h2>
<p style="margin-bottom: 20px;">This Agreement is effective for ${contractData.contractLength || hl('[duration]')} beginning ${hl(today)}.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">5. TERMINATION</h2>
<p style="margin-bottom: 20px;">Either party may terminate with ${hl('30 days')} written notice.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">6. GENERAL PROVISIONS</h2>
<p style="margin-bottom: 10px;"><strong>Governing Law:</strong> ${hl('[Your State]')}</p>
<p style="margin-bottom: 20px;"><strong>Entire Agreement:</strong> Supersedes all prior agreements.</p>

<div style="margin-top: 80px; border-top: 2px solid #E5E7EB; padding-top: 40px;">
    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 40px;">SIGNATURES</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
        <div>
            <p style="font-weight: bold; margin-bottom: 10px;">PROVIDER:</p>
            <p style="font-weight: 600; margin-bottom: 40px;">${hl(contractData.businessName)}</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 20px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666; margin-top: 8px;">Signature</p>
        </div>
        <div>
            <p style="font-weight: bold; margin-bottom: 10px;">CLIENT:</p>
            <p style="font-weight: 600; margin-bottom: 40px;">${hl(contractData.clientName)}</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 20px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666; margin-top: 8px;">Signature</p>
        </div>
    </div>
</div>
    `;
}

function generateProductContract(today, amplifiedScope, amplifiedDeliverables) {
    return `<h1 style="text-align: center; font-size: 28px; font-weight: bold; margin-bottom: 30px;">PRODUCT SALES AGREEMENT</h1>

<p style="margin-bottom: 20px;">This Agreement is entered into as of ${hl(today)} by and between:</p>

<p style="margin-bottom: 10px;"><strong>SELLER:</strong></p>
<p style="margin-bottom: 5px; font-weight: 600;">${hl(contractData.businessName)}</p>
<p style="margin-bottom: 30px;">Email: ${hl(contractData.businessEmail)}</p>

<p style="margin-bottom: 10px;"><strong>BUYER:</strong></p>
<p style="margin-bottom: 5px; font-weight: 600;">${hl(contractData.clientName)}</p>
<p style="margin-bottom: 30px;">Email: ${hl(contractData.clientEmail)}</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">1. PRODUCTS</h2>

<div style="background: #DBEAFE; border-left: 4px solid #3B82F6; padding: 12px; margin-bottom: 15px; border-radius: 4px;">
<p style="margin: 0; color: #1E40AF; font-size: 14px;"><strong>🤖 AI Enhanced</strong> - Product specifications expanded professionally.</p>
</div>

<div style="background: #F3F4F6; padding: 20px; border-left: 4px solid #6366F1; margin-bottom: 20px; line-height: 1.9;">
${formatBulletList(amplifiedScope)}
</div>

${contractData.quantity ? `<p style="margin-bottom: 20px;"><strong>Quantity:</strong> ${hl(contractData.quantity)}</p>` : ''}
${contractData.unitPrice ? `<p style="margin-bottom: 20px;"><strong>Unit Price:</strong> ${hl('$' + contractData.unitPrice)}</p>` : ''}

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">2. PURCHASE PRICE</h2>
<p style="margin-bottom: 20px;">Total purchase price: ${hl('$' + contractData.price)}</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">3. PAYMENT TERMS</h2>
<p style="margin-bottom: 20px;">${hl(contractData.paymentTerms)}</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">4. DELIVERY</h2>
${contractData.deliveryDate ? `<p style="margin-bottom: 10px;"><strong>Delivery Date:</strong> ${hl(contractData.deliveryDate)}</p>` : ''}
${contractData.deliveryLocation ? `<p style="margin-bottom: 20px;"><strong>Delivery Location:</strong> ${hl(contractData.deliveryLocation)}</p>` : ''}

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">5. INSPECTION & ACCEPTANCE</h2>
<p style="margin-bottom: 20px;">Buyer has ${hl('48 hours')} from delivery to inspect and reject non-conforming goods.</p>

<h2 style="font-size: 20px; font-weight: bold; margin-top: 40px; margin-bottom: 15px;">6. GENERAL PROVISIONS</h2>
<p style="margin-bottom: 10px;"><strong>Governing Law:</strong> ${hl('[Your State]')}</p>
<p style="margin-bottom: 20px;"><strong>Entire Agreement:</strong> Supersedes all prior agreements.</p>

<div style="margin-top: 80px; border-top: 2px solid #E5E7EB; padding-top: 40px;">
    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 40px;">SIGNATURES</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px;">
        <div>
            <p style="font-weight: bold; margin-bottom: 10px;">SELLER:</p>
            <p style="font-weight: 600; margin-bottom: 40px;">${hl(contractData.businessName)}</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 20px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666; margin-top: 8px;">Signature</p>
        </div>
        <div>
            <p style="font-weight: bold; margin-bottom: 10px;">BUYER:</p>
            <p style="font-weight: 600; margin-bottom: 40px;">${hl(contractData.clientName)}</p>
            <p style="border-bottom: 2px solid #000; padding-bottom: 20px;">&nbsp;</p>
            <p style="font-size: 14px; color: #666; margin-top: 8px;">Signature</p>
        </div>
    </div>
</div>`;
}

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('contractContent').focus();
}

function downloadContract() {
    const content = document.getElementById('contractContent').innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `SignFlow_Contract_${contractData.clientName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('✅ Contract downloaded! Paste into Google Docs or Word and save as PDF.');
}

function copyContract() {
    const content = document.getElementById('contractContent').innerText;
    navigator.clipboard.writeText(content).then(() => {
        alert('✅ Contract copied! Paste into Google Docs or Word.');
    });
}

// Only call updateProgress if the progress UI elements exist (create.html, not chat.html)
if (document.getElementById('step1')) updateProgress(1);
