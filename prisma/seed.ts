/**
 * Демо-данные: дома, жители и ~27 заявок в разных статусах,
 * чтобы панель УК и «Мои заявки» не были пустыми при первом запуске.
 */
import { PrismaClient } from "@prisma/client";
import type { Category, TicketStatus } from "../src/lib/domain";
import { DEMO_USER } from "../src/lib/demo";
import { RuleBasedPriorityClassifier } from "../src/lib/priority/rule-based";

const prisma = new PrismaClient();
const classifier = new RuleBasedPriorityClassifier();

const RESIDENTS = [
  DEMO_USER,
  { maxUserId: "seed-1", name: "Игорь Сафин" },
  { maxUserId: "seed-2", name: "Мария Галиева" },
  { maxUserId: "seed-3", name: "Олег Смирнов" },
  { maxUserId: "seed-4", name: "Лейла Хасанова" },
  { maxUserId: "seed-5", name: "Дмитрий Козлов" },
];

type SeedTicket = [user: number, building: number, entrance: number, category: Category, description: string, status: TicketStatus, hoursAgo: number];

const TICKETS: SeedTicket[] = [
  [1, 0, 1, "WATER", "Протечка трубы в подвале, вода на полу", "IN_PROGRESS", 3],
  [2, 0, 2, "ELECTRICITY", "На пятом этаже возле лифта не работает лампа", "NEW", 1],
  [3, 0, 3, "ELEVATOR", "Лифт застрял между 3 и 4 этажом, внутри никого", "ACCEPTED", 5],
  [4, 1, 1, "HEATING", "Холодные батареи в квартирах по стояку 45–60", "IN_PROGRESS", 20],
  [5, 0, 4, "GARBAGE", "Контейнерная площадка переполнена, мусор вокруг", "DONE", 70],
  [1, 0, 1, "CLEANING", "Не моют лестницу на 1–3 этажах уже две недели", "DONE", 120],
  [2, 1, 2, "DOORS", "Домофон не работает, дверь не закрывается", "IN_PROGRESS", 9],
  [3, 0, 2, "OTHER", "Сломана лавочка у подъезда", "REJECTED", 200],
  [4, 0, 3, "WATER", "Нет горячей воды с утра", "DONE", 48],
  [5, 1, 3, "ELECTRICITY", "Искрит щиток на третьем этаже, пахнет гарью", "DONE", 30],
  [1, 0, 2, "ELEVATOR", "Кнопка вызова лифта на 7 этаже не реагирует", "DONE", 96],
  [2, 0, 1, "CLEANING", "Паутина и грязные окна в подъезде", "NEW", 2],
  [3, 1, 1, "GARBAGE", "Не вывезли крупногабаритный мусор", "IN_PROGRESS", 26],
  [4, 0, 4, "HEATING", "Батарея в подъезде течёт", "DONE", 150],
  [5, 0, 1, "DOORS", "Скрипит входная дверь, нужна смазка", "DONE", 180],
  [1, 1, 2, "WATER", "Слабый напор холодной воды на верхних этажах", "IN_PROGRESS", 14],
  [2, 0, 3, "ELECTRICITY", "Не горит освещение у входа в подъезд", "DONE", 60],
  [3, 0, 4, "OTHER", "Запах газа на лестничной клетке 2 этажа", "DONE", 220],
  [4, 1, 3, "CLEANING", "После ремонта в кв. 34 строительный мусор на площадке", "IN_PROGRESS", 40],
  [5, 0, 2, "ELEVATOR", "Лифт останавливается не на своём этаже", "DONE", 260],
  [1, 0, 3, "GARBAGE", "Мусоропровод засорился", "DONE", 300],
  [2, 1, 1, "ELECTRICITY", "Нет света в подвале", "IN_PROGRESS", 7],
  [3, 0, 1, "WATER", "Течёт кран в техническом помещении", "DONE", 320],
  // Заявки демо-жителя — видны в «Мои заявки» на /demo
  [0, 0, 2, "ELECTRICITY", "На пятом этаже возле лифта не работает освещение", "IN_PROGRESS", 28],
  [0, 0, 2, "DOORS", "Домофон не открывает дверь по ключу", "DONE", 170],
  [0, 0, 2, "CLEANING", "Разлита краска на площадке 4 этажа", "NEW", 4],
];

/** Путь статусов, по которому заявка пришла к текущему. */
const PATH: Record<TicketStatus, TicketStatus[]> = {
  NEW: ["NEW"],
  ACCEPTED: ["NEW", "ACCEPTED"],
  IN_PROGRESS: ["NEW", "ACCEPTED", "IN_PROGRESS"],
  DONE: ["NEW", "ACCEPTED", "IN_PROGRESS", "DONE"],
  REJECTED: ["NEW", "REJECTED"],
};

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.ticketStatusHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.botSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.building.deleteMany();

  const buildings = await Promise.all([
    prisma.building.create({ data: { city: "Казань", street: "ул. Тестовая", house: "10", entrances: 4 } }),
    prisma.building.create({ data: { city: "Казань", street: "ул. Тестовая", house: "12", entrances: 3 } }),
  ]);
  const users = await Promise.all(RESIDENTS.map((r) => prisma.user.create({ data: r })));

  // Сортируем по времени создания, чтобы номера шли по хронологии.
  const sorted = [...TICKETS].sort((a, b) => b[6] - a[6]);
  let ticketNumber = 1001;
  const now = Date.now();

  for (const [u, b, entrance, category, description, status, hoursAgo] of sorted) {
    const createdAt = new Date(now - hoursAgo * 3_600_000);
    const { priority, reason } = await classifier.classify({ category, description });
    const path = PATH[status];
    // Шаги истории равномерно между созданием и «сейчас» (но не позже часа назад).
    const span = Math.max(hoursAgo - 0.5, 0.2) * 3_600_000;
    const history = path.map((s, i) => ({
      oldStatus: i === 0 ? null : path[i - 1]!,
      newStatus: s,
      createdAt: new Date(createdAt.getTime() + (span * i) / path.length),
    }));

    await prisma.ticket.create({
      data: {
        ticketNumber: ticketNumber++,
        userId: users[u]!.id,
        buildingId: buildings[b]!.id,
        entrance,
        category,
        description,
        status,
        priority,
        priorityReason: reason,
        createdAt,
        updatedAt: history.at(-1)!.createdAt,
        history: { create: history },
      },
    });
  }

  console.log(`✔ Seed: ${buildings.length} дома, ${users.length} жителей, ${TICKETS.length} заявок`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
