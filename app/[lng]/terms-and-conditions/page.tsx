"use client";

import React from "react";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";
import useLanguage from "@/lib/useLanguage";
import { Navbar, Footer } from "@/components";

// Définition des types stricts
interface SubSection {
    subservice_title?: string;
    subresponsibility_title?: string;
    subservice_content?: string[];
    subresponsibility_content?: string[];  // 👈 Il faut que ce soit un tableau de strings
}

type SectionContent = string | string[] | SubSection[];

const CGUPage: React.FC = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "legal");

    const sections = [
        { title: "introduction_title", content: "introduction_content" },
        { title: "definitions_title", content: "definitions_content" },
        { title: "access_title", content: "access_content" },
        { title: "services_title", content: "services_content" },
        { title: "subscriptions_title", content: "subscriptions_content" },
        { title: "payments_title", content: "payments_content" },
        { title: "commissions_title", content: "commissions_content" },
        { title: "responsabilities_title", content: "responsabilities_content" },
        { title: "cancellation_and_refund_title", content: "cancellation_and_refund_content" },
        { title: "intellectual_property_title", content: "intellectual_property_content" },
        { title: "data_protection_title", content: "data_protection_content" },
        { title: "modification_tcs_title", content: "modification_tcs_content" },
        { title: "applicable_law_and_competent_jurisdiction_title", content: "applicable_law_and_competent_jurisdiction_content" }
    ];

    return (
        <div className="min-h-screen flex flex-col text-gray-300">
            <Navbar lng={lng} />

            <main className="relative top-36 w-[95%] lg:w-full flex-grow max-w-4xl mx-auto p-8 bg-gray-800 rounded-xl shadow-lg mt-12 mb-20">
                <h1 className="text-4xl font-bold text-white mb-6 text-center">
                    {safeTranslate(t, "tcs_title")}
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
                                                {subsection.subservice_title || subsection.subresponsibility_title}
                                            </h3>

                                            {subsection.subservice_content &&
                                                Array.isArray(subsection.subservice_content) &&
                                                subsection.subservice_content.length > 0 && (
                                                    <ul className="list-disc pl-6 space-y-1 text-gray-300">
                                                        {subsection.subservice_content.map((item, itemIdx) => (
                                                            <li key={itemIdx}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}

                                            {subsection.subresponsibility_content &&
                                                Array.isArray(subsection.subresponsibility_content) &&
                                                subsection.subresponsibility_content.length > 0 && (
                                                    <ul className="list-disc pl-6 space-y-1 text-gray-300">
                                                        {subsection.subresponsibility_content.map((item, itemIdx) => (
                                                            <li key={itemIdx}>{item}</li>
                                                        ))}
                                                    </ul>
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

export default CGUPage;
