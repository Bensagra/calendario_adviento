import styles from "./EnvelopeLetter.module.css";

interface EnvelopeLetterProps {
  text: string;
}

export function EnvelopeLetter({ text }: EnvelopeLetterProps) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <section className={styles.scene} aria-label="Carta de Benyu para Danu">
      <div className={styles.ambient} aria-hidden="true">
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
        <span>♥</span>
      </div>

      <div className={styles.envelopeMoment} aria-hidden="true">
        <div className={styles.envelopeShadow} />
        <div className={styles.envelope}>
          <div className={styles.envelopeBack} />
          <div className={styles.flap} />
          <div className={styles.previewLetter}>
            <span className={styles.previewLine} />
            <span className={styles.previewLine} />
            <span className={styles.previewLineShort} />
            <span className={styles.previewHeart}>♥</span>
          </div>
          <div className={styles.envelopeFront} />
          <div className={styles.seal}>B<span>♥</span>D</div>
        </div>
      </div>

      <article className={styles.letter}>
        <div className={styles.paperTexture} aria-hidden="true" />
        <div className={styles.letterHeader} aria-hidden="true">
          <span />
          <b>19</b>
          <span />
        </div>

        <div className={styles.letterBody}>
          {paragraphs.map((paragraph, index) => {
            const isGreeting = index === 0;
            const isClosing = index >= paragraphs.length - 4;

            return (
              <p
                key={`${index}-${paragraph.slice(0, 18)}`}
                className={`${isGreeting ? styles.greeting : ""} ${isClosing ? styles.closing : ""}`}
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        <div className={styles.letterFooter} aria-hidden="true">
          <span>Para mi Danucha</span>
          <span className={styles.footerHeart}>♥</span>
          <span>Con amor eterno</span>
        </div>
      </article>
    </section>
  );
}
