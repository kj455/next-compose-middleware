import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Demo page：&nbsp;
        <a href="https://github.com/kj455/next-compose-middleware">
          kj455/next-compose-middleware
        </a>
      </h1>
      <p>
        Get started by editing&nbsp;
        <code className={styles.code}>src/middleware.ts</code>
      </p>
    </main>
  );
}
