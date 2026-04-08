interface FavoriteEvent {
  action: 'add' | 'remove' | 'list';
  userId: string;
  companyId: string;
}

export declare function main(event: FavoriteEvent, context: any): Promise<any>;