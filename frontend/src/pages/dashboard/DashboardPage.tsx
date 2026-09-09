import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/ui/PageHeader";

export default function DashboardPage() {
    const { t } = useTranslation("dashboard");

    return (
        <div>
            <PageHeader title={t("title")} subtitle={t("subtitle")} />

            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="text-2xl text-text-primary">Under Development</div>
            </div>
        </div>
    );
}