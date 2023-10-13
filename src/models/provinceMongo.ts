export interface ProvinceMongo {
    _id: string;
    name: string;
    code: string;
    cantons: Canton[];
    capital: string;
}

export interface Canton {
    code: string;
    name: string;
}