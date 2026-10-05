import { useLanguage } from '../../context/LanguageContext';

export const Skeleton = ({ className = '', ...props }) => (
  <div className={`skeleton-shimmer ${className}`} aria-hidden="true" {...props} />
);

export const PageSkeleton = () => {
  const { t } = useLanguage();
  return (
    <div className="page-shell space-y-5" aria-label={t('Loading page')}>
      <Skeleton className="h-10 w-56 max-w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
};
