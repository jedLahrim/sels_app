import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Products {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  product_name: string;
  @Column({ type: 'float8' })
  price: number;
}
