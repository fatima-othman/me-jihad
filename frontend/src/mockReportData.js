const mockReportData = {
    sections: [
        {
            section_key: "overview",
            section_title: "Overview",
            content: {
                summary: "This report gives a simple strategy direction for My Startup.",
                kpis: [
                    { title: "Revenue", value: "$18,500", note: "Good early result" },
                    { title: "Growth", value: "24%", note: "Monthly increase" },
                    { title: "Users", value: "1,200", note: "Current active users" },
                    { title: "Budget", value: "$2,500", note: "Testing budget" }
                ]
            }
        },

        {
            section_key: "swot_analysis",
            section_title: "SWOT Analysis",
            content: {
                strengths: ["Clear idea", "Simple service"],
                weaknesses: ["Small budget"],
                opportunities: ["Growing market"],
                threats: ["Strong competitors"]
            }
        },

        {
            section_key: "marketing_plan",
            section_title: "Marketing Plan",
            content: {
                intro: "Simple marketing plan for early users.",
                campaigns: [
                    {
                        title: "Instagram posts",
                        idea: "Share simple startup tips",
                        goal: "Increase awareness"
                    },
                    {
                        title: "University events",
                        idea: "Present the project",
                        goal: "Get first users"
                    }
                ]
            }
        },

        {
            section_key: "social_media_plan",
            section_title: "Social Media Plan",
            content: {
                intro: "Weekly simple posting plan.",
                schedule: [
                    {
                        day: "Monday",
                        platform: "Instagram",
                        content: "Startup tip"
                    },
                    {
                        day: "Wednesday",
                        platform: "LinkedIn",
                        content: "Case example"
                    }
                ]
            }
        },

        {
            section_key: "pricing_strategy",
            section_title: "Pricing Strategy",
            content: {
                notes: [
                    "Start with a simple monthly subscription.",
                    "Use a student-friendly price for early users.",
                    "Offer a free preview before full payment."
                ],
                competitors: [
                    {
                        name: "Competitor A",
                        price: "$12/month",
                        note: "More features but harder to use."
                    },
                    {
                        name: "Competitor B",
                        price: "$8/month",
                        note: "Affordable but less focused."
                    },
                    {
                        name: "StrategAI",
                        price: "$9/month",
                        note: "Balanced price with a simple report."
                    }
                ]
            }
        },

        {
            section_key: "growth_roadmap",
            section_title: "Growth Roadmap",
            content: {
                intro: "This roadmap shows simple growth steps for the first months.",
                milestones: [
                    {
                        phase: "Month 1",
                        goal: "Validate the idea",
                        tasks: [
                            "Talk to 10 target users",
                            "Show the demo to students"
                        ]
                    },
                    {
                        phase: "Month 2",
                        goal: "Launch pilot version",
                        tasks: [
                            "Release first report dashboard",
                            "Collect feedback from users"
                        ]
                    },
                    {
                        phase: "Month 3",
                        goal: "Improve engagement",
                        tasks: [
                            "Add better templates",
                            "Test one referral idea"
                        ]
                    }
                ]
            }
        },

        {
            section_key: "risk_analysis",
            section_title: "Risk Analysis",
            content: {
                intro: "This section shows a few simple risks for the first version of the project.",
                items: [
                    {
                        title: "Low early adoption",
                        impact: "The project may not get enough users at the beginning.",
                        response: "Offer free pilot access to a small group of target users."
                    },
                    {
                        title: "Weak report quality",
                        impact: "Users may feel that the generated report is too general.",
                        response: "Improve the report templates based on early feedback."
                    },
                    {
                        title: "Marketing fatigue",
                        impact: "Repeating the same type of content can reduce engagement.",
                        response: "Use different post styles and rotate content ideas."
                    }
                ]
            }
        }
    ]
};

export default mockReportData;