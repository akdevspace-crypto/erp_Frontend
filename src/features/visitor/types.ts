export type VisitorProfile = {
    id: string;
    mobile: string;
    name: string;
    category: string;
    company?: string;
    photoUrl?: string;
    email?: string;
    createdAt: string;
};

export type VisitorPass = {
    id: string;
    visitorId: string;
    passType: string;
    purpose?: string;
    department?: string;
    hostName?: string;
    hostMobile?: string;
    vehicleNo?: string;
    materialDetails?: string;
    checkInAt?: string;
    checkOutAt?: string;
    expectedAt?: string;
    status: string;
    qrCodeUrl?: string;
    createdAt: string;
    visitor?: VisitorProfile;
};
