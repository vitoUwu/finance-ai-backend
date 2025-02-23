self.addEventListener("push", (event) => {
  const options = event.data?.json();
  event.waitUntil(
    // @ts-ignore
    self.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon,
      badge: options.badge,
      data: options.data,
      actions: options.actions,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "open") {
    // @ts-ignore
    event.waitUntil(clients.openWindow("/"));
  }
});
