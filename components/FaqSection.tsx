"use client";

import { Collapse } from "antd";
import { useTranslation } from "../app/i18n";

const { Panel } = Collapse;

const FAQSection = ({ lng }: { lng: "en" | "fr" | "nl" }) => {
  const { t } = useTranslation(lng, "common");

  return (
    <section className="py-16 bg-white relative top-64 w-[95%] sm:w-full mx-auto">
      <div className="container mx-auto">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center mb-8">{t('faq.title')}</h2>
        <p className="text-center text-lg text-gray-600 mb-12">
          {t('faq.subtitle')}
        </p>

        {/* FAQ Items */}
        <Collapse defaultActiveKey={["1"]} accordion>
          {Object.keys(t('faq.items', { returnObjects: true })).map((key) => (
            <Panel header={t(`faq.items.${key}.header`)} key={key}>
              {t(`faq.items.${key}.content`)}
            </Panel>
          ))}
        </Collapse>
      </div>
    </section>
  );
};

export default FAQSection;
