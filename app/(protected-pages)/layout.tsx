import Template from '@/app/components/template';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	return <Template requireFingerprint={true}>{children}</Template>;
}
