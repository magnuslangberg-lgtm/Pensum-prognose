import dynamic from 'next/dynamic';

const PensumPrognoseModell = dynamic(
  () => import('../components/PensumPrognose'),
  { ssr: false }
);

export default function Home() {
  return <PensumPrognoseModell />;
}
