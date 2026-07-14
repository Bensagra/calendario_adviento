"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { WHATSAPP_RECIPIENT_PHONE } from "@/data/config";
import styles from "./ReunionVoucher.module.css";

const MAX_PLAN_LENGTH = 110;

const planPrompts = [
  "Ej: ir a comer algo rico juntos",
  "Ej: mirar una peli abrazados",
  "Ej: salir a caminar y contarte todo",
] as const;

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

function buildWhatsAppMessage(plans: string[]) {
  return [
    "Benyu ❤️ Ya elegí nuestros 3 planes para cuando vuelva:",
    "",
    `1. ${plans[0].trim()}`,
    `2. ${plans[1].trim()}`,
    `3. ${plans[2].trim()}`,
    "",
    "Guardate esta lista porque los quiero hacer todos con vos 🥰",
  ].join("\n");
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.4a9.45 9.45 0 0 0-8.17 14.2L2.5 21.5l5.02-1.31A9.5 9.5 0 1 0 12 2.4Zm0 17.15a7.67 7.67 0 0 1-3.91-1.07l-.28-.17-2.98.78.8-2.9-.19-.3A7.69 7.69 0 1 1 12 19.55Zm4.21-5.75c-.23-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.52.12-.15.23-.59.75-.73.9-.13.16-.27.18-.5.06-.23-.11-.97-.36-1.85-1.14a6.9 6.9 0 0 1-1.28-1.59c-.13-.23-.01-.35.1-.47.1-.1.23-.27.35-.4.11-.14.15-.24.23-.39.07-.15.03-.29-.02-.4-.06-.12-.52-1.25-.71-1.72-.19-.45-.38-.39-.52-.4h-.44c-.15 0-.4.06-.61.29-.21.23-.8.78-.8 1.91 0 1.12.82 2.21.93 2.36.12.16 1.61 2.46 3.9 3.45.55.23.97.38 1.3.48.55.17 1.04.15 1.43.09.44-.07 1.36-.56 1.55-1.09.19-.54.19-1 .13-1.09-.05-.1-.21-.16-.44-.27Z" fill="currentColor" />
    </svg>
  );
}

function RouteStrip() {
  return (
    <div className={styles.routeStrip}>
      <span><b>ISR</b><small>Ahora</small></span>
      <span className={styles.routeLine}><i>♥</i></span>
      <span><b>BUE</b><small>En 2 días</small></span>
    </div>
  );
}

function PlanInput({ index, value, onChange }: { index: number; value: string; onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void }) {
  const planNumber = String(index + 1).padStart(2, "0");

  return (
    <label className={styles.planField}>
      <span className={styles.planNumber}>{planNumber}</span>
      <span className={styles.planInputArea}>
        <strong>Plan {index + 1}</strong>
        <textarea
          value={value}
          onChange={onChange}
          maxLength={MAX_PLAN_LENGTH}
          rows={2}
          placeholder={planPrompts[index]}
          aria-label={`Plan ${index + 1}`}
        />
        <small>{value.length}/{MAX_PLAN_LENGTH}</small>
      </span>
    </label>
  );
}

function FormStage({ plans, onPlanChange, onSubmit }: { plans: string[]; onPlanChange: (index: number, value: string) => void; onSubmit: () => void }) {
  const completedPlans = plans.filter((plan) => plan.trim()).length;
  const isComplete = completedPlans === 3;

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isComplete) onSubmit();
  };

  return (
    <div className={styles.stageIn}>
      <RouteStrip />

      <div className={styles.introCopy}>
        <p>Agenda del reencuentro</p>
        <h3>Danu, esta vez<br /><em>elegís vos.</em></h3>
        <span>Escribí tres planes que quieras hacer conmigo cuando vuelvas. Pueden ser simples, locos o muy nuestros.</span>
      </div>

      <form onSubmit={submitForm} className={styles.form}>
        <div className={styles.fields}>
          {plans.map((plan, index) => (
            <PlanInput
              key={index}
              index={index}
              value={plan}
              onChange={(event) => onPlanChange(index, event.target.value)}
            />
          ))}
        </div>

        <div className={styles.progress}>
          <span><i style={{ width: `${(completedPlans / 3) * 100}%` }} /></span>
          <p>{isComplete ? "Lista completa. Ya me la podés mandar ❤️" : `${completedPlans} de 3 planes escritos`}</p>
        </div>

        <button type="submit" disabled={!isComplete} className={styles.primaryButton}>
          Preparar mensaje <span>→</span>
        </button>
      </form>
    </div>
  );
}

function MessageStage({ plans, copyStatus, onCopy, onWhatsApp, onEdit }: { plans: string[]; copyStatus: string; onCopy: () => void; onWhatsApp: () => void; onEdit: () => void }) {
  const message = buildWhatsAppMessage(plans);
  const hasDirectRecipient = Boolean(WHATSAPP_RECIPIENT_PHONE.replace(/\D/g, ""));

  return (
    <div className={`${styles.stageIn} ${styles.messageStage}`}>
      <div className={styles.readyBadge}><span>✓</span> Lista terminada</div>
      <h3>Estos son nuestros<br /><em>próximos planes.</em></h3>
      <p className={styles.readyCopy}>El mensaje ya está armado para mandárselo a Benyu.</p>

      <div className={styles.messageCard}>
        <div className={styles.messageHeader}>
          <span className={styles.avatar}>B</span>
          <span><b>Benyu</b><small>WhatsApp</small></span>
          <i>•••</i>
        </div>
        <p>{message}</p>
        <div className={styles.messageTime}>ahora <span>✓✓</span></div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onWhatsApp} className={styles.whatsAppButton}>
          <WhatsAppIcon />
          Mandárselos por WhatsApp
        </button>
        <button type="button" onClick={onCopy} className={styles.copyButton}>
          {copyStatus || "Copiar mensaje"}
        </button>
      </div>

      <p className={styles.sendHint}>
        {hasDirectRecipient
          ? "Se abre tu chat con Benyu y el mensaje listo. Solo falta tocar Enviar."
          : "WhatsApp se abre con el mensaje listo. Elegí el chat de Benyu y tocá Enviar."}
      </p>

      <div className={styles.loveNote}>
        <span>♥</span>
        <p>Yo pongo el tiempo, los abrazos y las ganas de hacer los tres. Vos solamente tenés que volver.</p>
        <strong>En dos días empieza nuestra nueva lista.</strong>
      </div>

      <button type="button" onClick={onEdit} className={styles.editButton}>← Editar mis planes</button>
    </div>
  );
}

export function ReunionVoucher() {
  const [plans, setPlans] = useState(["", "", ""]);
  const [messageReady, setMessageReady] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const changePlan = (index: number, value: string) => {
    setPlans((current) => current.map((plan, planIndex) => planIndex === index ? value : plan));
  };

  const prepareMessage = () => {
    if (plans.some((plan) => !plan.trim())) return;
    vibrate([35, 35, 75]);
    setMessageReady(true);
  };

  const copyMessage = async () => {
    const message = buildWhatsAppMessage(plans);

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(message);
      setCopyStatus("¡Mensaje copiado! ✓");
    } catch {
      setCopyStatus("No se pudo copiar");
    }

    window.setTimeout(() => setCopyStatus(""), 2200);
  };

  const openWhatsApp = () => {
    const message = buildWhatsAppMessage(plans);
    const phone = WHATSAPP_RECIPIENT_PHONE.replace(/\D/g, "");
    const destination = phone ? `https://wa.me/${phone}` : "https://wa.me/";
    vibrate(35);
    window.open(`${destination}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className={styles.shell}>
      <div className={styles.paperTexture} />
      <header className={styles.header}>
        <span>PLANES DE REGRESO · DÍA 018</span>
        <span className={styles.liveDot}><i /> FALTAN 2 DÍAS</span>
      </header>

      <div className={styles.content}>
        {messageReady ? (
          <MessageStage
            plans={plans}
            copyStatus={copyStatus}
            onCopy={copyMessage}
            onWhatsApp={openWhatsApp}
            onEdit={() => setMessageReady(false)}
          />
        ) : (
          <FormStage plans={plans} onPlanChange={changePlan} onSubmit={prepareMessage} />
        )}
      </div>
    </section>
  );
}
