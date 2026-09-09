import { useState, type SubmitEvent } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '../../redux/features/api/authApi/authApi';
import { Button } from '../../components/ui/Button';
import { Footer } from '../../components/ui/Footer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getErrorMessage } from '../../utils/getErrorMessage';
import logo from "../../assets/logo/jatiyo-sangsad.webp"

export default function LoginPage() {
    const { t } = useTranslation(['login', 'common']);
    useDocumentTitle(t('pageTitle'));
    const navigate = useNavigate();
    const location = useLocation();
    const [login, { isLoading }] = useLoginMutation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setFormError('');

        if (!email || !password) {
            setFormError(t('errorRequired'));
            return;
        }

        try {
            await login({ email, password }).unwrap();
            const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
            navigate(from ?? '/dashboard', { replace: true });
        } catch (err) {
            setFormError(getErrorMessage(err as never));
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            {/* Card */}
            <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
                <div
                    className="w-full max-w-[440px] overflow-hidden rounded-[20px] bg-surface"
                    style={{
                        boxShadow: '0 20px 60px -20px oklch(0 0 0 / 0.18), 0 2px 8px oklch(0 0 0 / 0.04)',
                        animation: 'fadeUp 0.5s ease both',
                    }}
                >
                    <div className="px-6 pb-8 pt-9 sm:px-11 sm:pb-10 sm:pt-12">
                        <div className="mb-5 flex justify-center sm:mb-6">
                            <div className="flex h-28 w-28 items-center justify-center rounded-full p-2 sm:h-[112px] sm:w-[112px]">
                                <img
                                    src={logo}
                                    alt="Jatiya Sangsad Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="mb-6 text-center sm:mb-[30px]">
                            <div className="mb-1.5 text-lg font-extrabold text-text-primary sm:text-[22px]">
                                {t('common:officeTitle')}
                            </div>
                            <div className="text-xs text-text-secondary sm:text-[13.5px]">
                                {t('common:constituency')}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-[18px]">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-[7px] block text-[13px] font-semibold text-text-secondary"
                                >
                                    {t('emailLabel')}
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setFormError('');
                                    }}
                                    placeholder={t('emailPlaceholder')}
                                    className="w-full rounded-[10px] border-[1.5px] border-surface-border bg-surface px-3.5 py-3 text-sm text-text-primary transition-colors"
                                />
                            </div>

                            <div>
                                <div className="mb-[7px] flex flex-wrap items-center justify-between gap-1">
                                    <label
                                        htmlFor="password"
                                        className="text-[13px] font-semibold text-text-secondary"
                                    >
                                        {t('passwordLabel')}
                                    </label>
                                    <a href="#" className="text-[12.5px] font-semibold text-primary">
                                        {t('forgot')}
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        required
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setFormError('');
                                        }}
                                        placeholder="••••••••"
                                        className="w-full rounded-[10px] border-[1.5px] border-surface-border bg-surface py-3 pl-3.5 pr-11 text-sm text-text-primary transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? t('hide') : t('show')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent p-1 text-text-secondary"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                            </div>

                            {formError && (
                                <div className="rounded-lg bg-danger-soft-bg px-3 py-2.5 text-[12.5px] text-danger-soft-text">
                                    {formError}
                                </div>
                            )}

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="mt-1.5 w-full !rounded-[10px] !py-3 !text-sm sm:!py-[13px] sm:!text-[14.5px]"
                            >
                                {isLoading ? t('submitting') : t('submit')}
                            </Button>
                        </form>

                        <div className="mt-5 border-t border-surface-border pt-4 text-center text-[11px] text-text-secondary sm:mt-[26px] sm:pt-5 sm:text-xs">
                            {t('footer')}
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}