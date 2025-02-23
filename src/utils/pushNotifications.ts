async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Obter a chave pública do servidor
    const response = await fetch("/api/notifications/push/public-key");
    const { publicKey } = await response.json();

    // Solicitar permissão e criar subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    // Enviar subscription para o servidor
    await fetch("/api/notifications/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription }),
    });

    console.log("Successfully subscribed to push notifications");
  } catch (error) {
    console.error("Failed to subscribe to push notifications:", error);
  }
}

export async function initializePushNotifications() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      // Registrar service worker
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered");

      // Verificar permissão
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeToPushNotifications();
      }
    } catch (error) {
      console.error("Failed to initialize push notifications:", error);
    }
  }
}
