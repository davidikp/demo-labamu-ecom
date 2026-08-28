// Mock data + in-memory "store" for the Customer module. There is no real
// backend yet — every list/detail/create/edit page in this repo works
// against a mock array plus local state, mirroring the pattern used by
// materials/mock/materialsMocks.js and work-order/mock/workOrderMocks.js.

export const MOCK_CUSTOMER_TAGS = [
  { id: "tag-1", name: "VIP", status: "Active" },
  { id: "tag-2", name: "Wholesale", status: "Active" },
  { id: "tag-3", name: "Retail", status: "Active" },
  { id: "tag-4", name: "Government", status: "Inactive" },
  { id: "tag-5", name: "Export", status: "Active" },
];

let customerTagSeq = MOCK_CUSTOMER_TAGS.length;
export const nextCustomerTagId = () => `tag-${++customerTagSeq}`;

export const MOCK_CUSTOMERS = [
  {
    id: "cust-1",
    name: "PT. Bergerak Maju",
    email: "gerak@mail.com",
    phoneCode: "+62",
    phone: "8409430439",
    country: "Indonesia",
    address: "Jl. Gatot Subroto No. 12, Jakarta Selatan, 12930",
    tags: ["tag-1", "tag-2"],
    screeningStatus: "Pass",
    lastScreenedAt: "2026-08-10 09:24",
    pics: [
      {
        id: "pic-1-1",
        primary: true,
        name: "Untung Prayetno",
        email: "untung.prayetno@cashenable.com",
        role: "Approver",
        phoneCode: "+62",
        phone: "81585848002",
      },
    ],
  },
  {
    id: "cust-2",
    name: "Ideal For Living",
    email: "ideal@ifl.co.kr",
    phoneCode: "+82",
    phone: "888333222",
    country: "South Korea",
    address: "123 Gangnam-daero, Seoul",
    tags: ["tag-3"],
    screeningStatus: "Pass",
    lastScreenedAt: "2026-07-22 14:02",
    pics: [
      {
        id: "pic-2-1",
        primary: true,
        name: "Revy",
        email: "refi.prathama@cashenable.com",
        role: "Viewer",
        phoneCode: "+62",
        phone: "81221471900",
      },
    ],
  },
  {
    id: "cust-3",
    name: "Apple Inc.",
    email: "apple@mail.com",
    phoneCode: "+62",
    phone: "87789678263",
    country: "United States",
    address: "One Apple Park Way, Cupertino, CA",
    tags: ["tag-5"],
    screeningStatus: "Fail",
    lastScreenedAt: "2026-08-20 11:15",
    pics: [],
  },
];

let customerSeq = MOCK_CUSTOMERS.length;
export const nextCustomerId = () => `cust-${++customerSeq}`;

export const createCustomer = (data) => {
  const record = {
    id: nextCustomerId(),
    screeningStatus: "Pass",
    lastScreenedAt: null,
    tags: [],
    pics: [],
    ...data,
  };
  MOCK_CUSTOMERS.unshift(record);
  return record;
};

export const updateCustomer = (id, data) => {
  const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (index === -1) return null;
  MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...data };
  return MOCK_CUSTOMERS[index];
};

export const deleteCustomer = (id) => {
  const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (index === -1) return false;
  MOCK_CUSTOMERS.splice(index, 1);
  return true;
};

export const getCustomerTagLabel = (tagId) =>
  MOCK_CUSTOMER_TAGS.find((t) => t.id === tagId)?.name || tagId;
