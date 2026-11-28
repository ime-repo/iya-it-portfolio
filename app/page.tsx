"use client";

import { useState } from "react";

type Category = "All" | "Development" | "Design" | "Documentation";

type Project = {
    number: string;
    title: string;
    category: Category;
    label: string;
    year: string;
    role: string;
    summary: string;
    details: string;
    stack: string[];
    tone: string;
};

const projects: Project[] = [
    {
        number: "01",
        title: "UDM Virtual Queue System",
        category: "Development",
        label: "ACADEMIC WEB PROJECT",
        year: "2025",
        role: "Developer",
        summary: "A web-based queue management system for university services.",
        details:
            "My contribution included building UI components and core features, testing the system, identifying issues, and helping with debugging and interface improvements.",
        stack: ["PHP", "HTML", "CSS", "JavaScript", "Testing"],
        tone: "blue",
    },
    {
        number: "02",
        title: "MediTrack",
        category: "Development",
        label: "PERSONAL WEB APPLICATION",
        year: "2026",
        role: "Personal Developer",
        summary:
            "A medication tracking application for organizing medication schedules and daily entries.",
        details:
            "A personal coding project exploring medication entry management, dosage and schedule organization, and daily tracking features.",
        stack: ["Next.js", "React", "TypeScript"],
        tone: "lime",
    },
];

const additionalWork = [
    {
        title: "CED-Vault",
        type: "UI Design",
        role: "Canva interface design",
        description:
            "Designed interface layouts and visual components for an academic document management system, focusing on usability and workflow organization.",
        tools: ["Canva", "UI Design", "Layout Design"],
    },
    {
        title: "QR-Enabled Class Attendance",
        type: "Documentation",
        role: "Documentation support",
        description:
            "Prepared and organized system requirements and development-related documentation for an academic QR-based attendance monitoring project.",
        tools: ["Documentation", "Requirements", "Project Support"],
    },
];

const skillGroups = [
    {
        title: "Web technologies",
        note: "Coursework and academic project use",
        items: ["HTML", "CSS", "JavaScript", "PHP"],
    },
    {
        title: "Design",
        note: "Visual and interface work",
        items: ["Canva", "Figma", "UI Design", "Graphic Design"],
    },
    {
        title: "Tools & workflow",
        note: "Building, testing, and organizing",
        items: ["VS Code", "XAMPP", "Microsoft Office", "Documentation", "System Testing"],
    },
];

const filters: Category[] = ["All", "Development"];

const navLinks = [
    ["Work", "#work"],
    ["Toolkit", "#toolkit"],
    ["Contact", "#contact"],
];

export default function Home() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [filter, setFilter] = useState<Category>("All");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const visibleProjects = projects.filter(
        (project) => filter === "All" || project.category === filter
    );

    return (
        <main id= "top" >
        <header className="site-header" >
            <a className="wordmark" href = "#top" aria-label="Iya Elardo home" >
                IYA<span>.</span>
                </a>

                < button
    className = "menu-toggle"
    onClick = {() => setMenuOpen((open) => !open)
}
aria-expanded={ menuOpen }
aria-label="Toggle navigation"
type = "button"
    >
{ menuOpen? "CLOSE −": "MENU +" }
    </button>

    < nav
className = { menuOpen? "nav nav-open": "nav" }
aria-label="Main navigation"
    >
{
    navLinks.map(([label, href]) => (
        <a key= { label } href = { href } onClick = {() => setMenuOpen(false)} >
{ label }
    </a>
                    ))}
</nav>
    </header>

    < section className = "hero hero-centered" aria-labelledby="hero-title" >
        <div className="hero-copy-block" >
            <p className="eyebrow" >
                <span className="status-dot" />
                    INFORMATION TECHNOLOGY STUDENT
                        < span className = "eyebrow-divider" > /</span >
                            MANILA, PH
                            </p>

                            < h1 id = "hero-title" >
                                Curious mind.
                        < br />
                                    <span>Practical </span>maker
                                    < span className = "hero-period" >.</span>
                                        </h1>

                                        < p className = "hero-intro" >
                                            I’m Iya — an IT student interested in building useful digital
                        experiences through web development, interface design, and
                        thoughtful problem - solving.
                    </p>

    < div className = "hero-actions" >
        <a className="button-primary" href = "#work" >
            Explore selected work<span>↘</span>
                </a>
                < a className = "text-link" href = "#contact" >
                    Get in touch<span>↗</span>
                        </a>
                        </div>

                        < div className = "hero-meta" >
                            <span>BS INFORMATION TECHNOLOGY </span>
                                < span > UNIVERSIDAD DE MANILA </span>
                                    < span > 2023 — PRESENT </span>
                                        </div>
                                        </div>
                                        </section>

                                        < section className = "work section-shell" id = "work" >
                                            <div className="section-top" >
                                                <span>01 / SELECTED WORK </span>
                                                    < span > REAL ROLES.HONEST CONTRIBUTIONS.</span>
                                                        </div>

                                                        < div className = "section-heading" >
                                                            <h2>
                                                            Work in
                                                            <br />
                                                            < span > progress & amp; practice.</span>
                                                                </h2>
                                                                <p>
                        A selection of academic work and the roles I actually played.
                        New projects will be added as they are completed.
                    </p>
    </div>

    < div className = "filter-row" aria-label="Filter projects" >
    {
        filters.map((item) => (
            <button
                            key= { item }
                            className = { filter === item ? "filter-chip active" : "filter-chip"}
onClick = {() => setFilter(item)}
type = "button"
    >
    { item }
    <span>
{
    item === "All"
    ? projects.length
    : projects.filter((project) => project.category === item).length
}
</span>
    </button>
                    ))}
</div>

    < div className = "project-grid" >
    {
        visibleProjects.map((project) => (
            <article
                            className= {`project-card compact-project ${project.tone}`}
key = { project.number }
    >
    <div className="compact-project-top" >
        <span>{ project.label } </span>
        < span > { project.year } </span>
        </div>
        < span className = "compact-project-number" > { project.number } </span>
            < h3 > { project.title } </h3>
            < p > { project.summary } </p>

            < div className = "role-row" >
                <span>ROLE </span>
                < strong > { project.role } </strong>
                </div>

                < div className = "tag-list" >
                {
                    project.stack.slice(0, 3).map((tag) => (
                        <span key= { tag } > { tag } </span>
                    ))
                }
{
    project.stack.length > 3 && (
        <span>+{ project.stack.length - 3 } more </span>
                                )
}
</div>

    < button
className = "project-more-button"
onClick = {() => setSelectedProject(project)}
aria-label={ `More details about ${project.title}` }
type = "button"
    >
    More details<span>↗</span>
        </button>
        </article>
                    ))}
</div>

    < div className = "additional-section" >
        <div className="additional-heading" >
            <div>
            <span className="eyebrow" > MORE EXPERIENCE </span>
                < h3 > Other academic work.</h3>
                    </div>
                    <p>
                            Design and documentation contributions from academic projects.
                        </p>
    </div>

    < div className = "skill-grid" >
    {
        additionalWork.map((item) => (
            <article className= "skill-card" key = { item.title } >
            <span className="skill-index" > { item.type } </span>
            < h3 > { item.title } </h3>
            < p > { item.description } </p>
        < div className = "role-row" >
        <span>MY CONTRIBUTION </span>
        < strong > { item.role } </strong>
        </div>
        < div className = "tag-list" >
        {
            item.tools.map((tool) => (
                <span key= { tool } > { tool } </span>
            ))
    }
        </div>
        </article>
                        ))}
</div>
    </div>
    </section>

{
    selectedProject && (
        <div
                    className="project-modal-overlay"
    role = "presentation"
    onClick = {() => setSelectedProject(null)
}
                >
    <section
                        className="project-modal"
role = "dialog"
aria-modal="true"
aria-labelledby="project-modal-title"
onClick = {(event) => event.stopPropagation()}
                    >
    <button
                            className="project-modal-close"
onClick = {() => setSelectedProject(null)}
aria-label="Close project details"
type = "button"
    >
                            ×
</button>

    < div className = "project-modal-heading" >
        <span>{ selectedProject.label } </span>
        < span > { selectedProject.year } </span>
        </div>
        < h2 id = "project-modal-title" > { selectedProject.title } </h2>
            < p className = "project-modal-summary" > { selectedProject.summary } </p>

                < div className = "project-modal-gallery" >
                    <div className="project-image-placeholder" >
                        <span>PROJECT IMAGE 01 </span>
                            < p > Your project screenshot can be placed here.</p>
                                </div>
                                < div className = "project-image-placeholder" >
                                    <span>PROJECT IMAGE 02 </span>
                                        < p > Add another interface or project screenshot here.</p>
                                            </div>
                                            </div>

                                            < div className = "project-modal-section" >
                                                <span className="eyebrow" > ABOUT THE PROJECT </span>
                                                    < p > { selectedProject.details } </p>
                                                    </div>
                                                    < div className = "project-modal-section" >
                                                        <span className="eyebrow" > MY ROLE </span>
                                                            < p > { selectedProject.role } </p>
                                                            </div>
                                                            < div className = "project-modal-section" >
                                                                <span className="eyebrow" > TOOLS & amp; TECHNOLOGIES </span>
                                                                    < div className = "tag-list" >
                                                                    {
                                                                        selectedProject.stack.map((tag) => (
                                                                            <span key= { tag } > { tag } </span>
                                                                        ))
                                                                    }
                                                                        </div>
                                                                        </div>
                                                                        </section>
                                                                        </div>
            )}

<section className="toolkit section-shell" id = "toolkit" >
    <div className="section-top" >
        <span>02 / TOOLKIT </span>
        < span > TOOLS I’VE WORKED WITH </span>
            </div>

            < div className = "section-heading" >
                <h2>
                Things I use
                    < br />
                    <span>to make things.</span>
                        </h2>
                        <p>
                        A growing set of tools and skills from coursework, collaboration,
    and personal practice.
                    </p>
        </div>

        < div className = "skill-grid" >
            {
                skillGroups.map((group, index) => (
                    <article className= "skill-card" key = { group.title } >
                    <span className="skill-index" > 0{ index + 1} / </span>
            < h3 > { group.title } </h3>
            < p > { group.note } </p>
            < div className = "tag-list" >
            {
                group.items.map((item) => (
                    <span key= { item } > { item } </span>
                ))
            }
                </div>
                </article>
                    ))}
</div>
    </section>

    < section className = "contact section-shell" id = "contact" >
        <div className="section-top" >
            <span>03 / CONTACT </span>
            < span > OPEN TO OPPORTUNITIES </span>
                </div>

                < div className = "contact-content" >
                    <p className="eyebrow" > HAVE A PROJECT OR OPPORTUNITY ? </p>
                        <h2>
                        Let’s make
    < br />
    <span>something matter.</span>
        </h2>
        <p>
I’m open to internship opportunities, collaborations, and
                        conversations about technology and design.
                    </p>
    < a className = "button-primary" href = "mailto:iyamelardo@gmail.com" >
        iyamelardo@gmail.com<span>↗</span>
            </a>
            </div>

            < div className = "contact-foot" >
                <span>MANILA, PHILIPPINES </span>
                < a href = "#top" > BACK TO TOP ↑</a>
                    </div>
                    </section>

                    < footer className = "footer" >
                        <a className="wordmark" href = "#top" >
                            IYA<span>.</span>
                            </a>
                            < span > Designed, built, and still evolving.</span>
                                <span>© { new Date().getFullYear() } IYA ELARDO </span>
                                    </footer>
                                    </main>
    );
}