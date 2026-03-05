import { clients, messages, nutritionPlans, programs } from "../mocks";

export const dataService = {
  getClients: () => clients,
  getClientById: (id: string) => clients.find((client) => client.id === id),
  getProgramByClientId: (clientId: string) => programs.find((program) => program.clientId === clientId),
  getNutritionByClientId: (clientId: string) =>
    nutritionPlans.find((nutritionPlan) => nutritionPlan.clientId === clientId),
  getMessagesByClientId: (clientId: string) => messages.filter((message) => message.clientId === clientId),
};
