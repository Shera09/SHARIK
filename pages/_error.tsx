import { NextPageContext } from 'next';

export default function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p>{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
