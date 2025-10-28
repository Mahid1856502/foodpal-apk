import { Alert } from 'react-native';
import { BluetoothDevice } from 'react-native-bluetooth-classic';
import { Order, OrderItem } from '../../../types/base';

/**
 * 🧾 Print a formatted receipt for a given order using ESC/POS commands
 */
export const PrintOrderDetails = async (
  device: BluetoothDevice,
  order: Order,
) => {
  try {
    // Ensure printer is connected
    let connected = await device.isConnected();
    if (!connected) {
      await device.connect();
    }

    const init = '\x1B\x40'; // Initialize printer
    const boldOn = '\x1B\x45\x01';
    const boldOff = '\x1B\x45\x00';
    const alignCenter = '\x1B\x61\x01';
    const alignLeft = '\x1B\x61\x00';
    const alignRight = '\x1B\x61\x02';
    const cut = '\x1D\x56\x42\x00';
    const newLine = '\n';

    // Build text-based layout
    let receipt = init;

    // HEADER
    receipt += alignCenter;
    if (order?.restaurant?.name) {
      receipt +=
        boldOn + order.restaurant.name.toUpperCase() + boldOff + newLine;
    }
    receipt += '-----------------------------' + newLine;
    receipt +=
      boldOn + (order?.orderType?.toUpperCase() ?? 'ORDER') + boldOff + newLine;
    receipt += 'ORDER #' + (order?.id?.slice(-5) ?? 'N/A') + newLine;
    receipt += '-----------------------------' + newLine;

    // PICKUP / ETA
    receipt += alignLeft;
    receipt += `Pickup Slot: ${order?.pickupTimeSlot ?? '-'}${newLine}`;
    receipt += `ETA: ${order?.etaMinutes ? order.etaMinutes + ' min' : '-'}${newLine}`;
    receipt += newLine;

    // ITEMS
    receipt += '--- ITEMS -------------------' + newLine;
    receipt += renderGroupedItems(order.items);
    receipt += '-----------------------------' + newLine;

    // TOTALS
    const totalItems = order?.items?.length ?? 0;
    const totalAmount = parseFloat(order?.totalAmount ?? '0').toFixed(2);
    const paymentMethod = order?.paymentMethod ?? '-';
    const paymentStatus =
      order?.paymentStatus === 'PAID'
        ? 'ORDER HAS BEEN PAID'
        : 'PAYMENT PENDING';

    receipt += `Total Items: ${totalItems}${newLine}`;
    receipt += boldOn + `Total: £${totalAmount}` + boldOff + newLine;
    receipt += `Payment: ${paymentMethod}${newLine}`;
    receipt += '-----------------------------' + newLine;
    receipt += alignCenter + boldOn + paymentStatus + boldOff + newLine;
    receipt += alignLeft + '-----------------------------' + newLine;

    // CUSTOMER
    receipt += boldOn + 'CUSTOMER DETAILS' + boldOff + newLine;
    receipt += `Name: ${order?.user?.fullName ?? '-'}${newLine}`;
    receipt += `Phone: ${order?.user?.mobileNumber ?? '-'}${newLine}`;
    receipt += `Address: ${
      order?.deliveryAddress?.streetName ?? order?.branch?.address ?? '-'
    }${newLine}`;

    // FOOTER
    receipt += '-----------------------------' + newLine;
    receipt += alignCenter;
    receipt += `Placed: ${
      order?.createdAt ? new Date(order.createdAt).toLocaleString() : '-'
    }${newLine}`;
    receipt += `Branch: ${order?.branch?.name ?? '-'}` + newLine;
    receipt += newLine.repeat(3);
    receipt += cut;

    // Send to printer
    await device.write(receipt);
    Alert.alert('✅ Printed', 'Order receipt sent to printer.');
  } catch (e) {
    console.error('[BT] Print error:', e);
    Alert.alert('Print Error', String(e));
  }
};

/* ---------------- Helper: Render grouped items ---------------- */
function renderGroupedItems(items: OrderItem[]): string {
  if (!items?.length) return 'No items found\n';

  const grouped = items.reduce<Record<string, OrderItem[]>>((acc, item) => {
    const category = item.foodItem?.category ?? 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  let result = '';
  for (const [category, groupedItems] of Object.entries(grouped)) {
    result += `${category.toUpperCase()} (${groupedItems.length})\n`;
    for (const item of groupedItems) {
      result += renderOrderItem(item);
    }
    result += '\n';
  }
  return result;
}

/* ---------------- Helper: Render one item ---------------- */
function renderOrderItem(item: OrderItem): string {
  let line = `${item.quantity} × ${item.foodItem?.name ?? 'Item'}  £${parseFloat(
    item.price ?? '0',
  ).toFixed(2)}\n`;

  const addons = item.addOns ?? [];
  for (const addon of addons) {
    const addOnData = addon.addOn;
    if (addOnData) {
      line += `  + ${addOnData.name} (£${parseFloat(
        addOnData.price ?? '0',
      ).toFixed(2)})\n`;
    }
  }
  return line;
}
