"use client";

import React from "react";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";
import useLanguage from "@/lib/useLanguage";
import { Navbar, Footer } from "@/components";

// Définition des types stricts
interface SubSection {
    subdata_title?: string;
    subsharing_title?: string;
    subright_title?: string;
    subdata_content?: string[];
    subsharing_content?: string;
    subright_content?: string;
}

type SectionContent = string | string[] | SubSection[];

const PrivacyPage: React.FC = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "privacy");

    const sections = [
        { title: "introduction_title", content: "introduction_content" },
        { title: "data_collected_title", content: "data_collected_content" },
        { title: "data_usage_title", content: "data_usage_content" },
        { title: "data_sharing_title", content: "data_sharing_content" },
        { title: "data_retention_title", content: "data_retention_content" },
        { title: "user_rights_title", content: "user_rights_content" },
        { title: "data_security_title", content: "data_security_content" },
        { title: "cookies_title", content: "cookies_content" },
        { title: "cookies_management_title", content: "cookies_management_content" },
        { title: "policy_modifications_title", content: "policy_modifications_content" },
        { title: "contact_title", content: "contact_content" }
    ];

    return (
        <div className="min-h-screen flex flex-col text-gray-300">
            <Navbar lng={lng} />

            <main className="relative top-36 w-[95%] lg:w-full flex-grow max-w-4xl mx-auto p-8 bg-gray-800 rounded-xl shadow-lg mt-12 mb-20">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">
                    {safeTranslate(t, "privacy_policy_title")}
                </h1>

                {sections.map((section, index) => {
                    const sectionTitle = safeTranslate(t, section.title);
                    const sectionContent = t(section.content, { returnObjects: true }) as SectionContent;

                    return (
                        <div key={index} className="mb-8">
                            <h2 className="text-2xl font-semibold text-white mb-3 border-b border-gray-700 pb-2">
                                {sectionTitle}
                            </h2>

                            {typeof sectionContent === "string" && (
                                <p className="text-gray-400 leading-relaxed">{sectionContent}</p>
                            )}

                            {Array.isArray(sectionContent) && sectionContent.length > 0 && typeof sectionContent[0] === "string" && (
                                <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                    {(sectionContent as string[]).map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            )}

                            {Array.isArray(sectionContent) && sectionContent.length > 0 && typeof sectionContent[0] === "object" && (
                                <div className="space-y-4">
                                    {(sectionContent as SubSection[]).map((subsection, subIdx) => (
                                        <div key={subIdx} className="p-4 rounded-lg bg-gray-700">
                                            <h3 className="text-lg font-medium text-white mb-2">
                                                {subsection.subdata_title || subsection.subsharing_title || subsection.subright_title}
                                            </h3>

                                            {subsection.subdata_content &&
                                                Array.isArray(subsection.subdata_content) &&
                                                subsection.subdata_content.length > 0 && (
                                                    <ul className="list-disc pl-6 space-y-1 text-gray-300">
                                                        {subsection.subdata_content.map((item, itemIdx) => (
                                                            <li key={itemIdx}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                            {subsection.subsharing_content && (
                                                <p className="text-gray-300">{subsection.subsharing_content}</p>
                                            )}

                                            {subsection.subright_content && (
                                                <p className="text-gray-300">{subsection.subright_content}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPage;
