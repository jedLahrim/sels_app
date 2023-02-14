import { DataSource, DataSourceOptions } from 'typeorm';

const dataSource_config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 8884,
  username: 'joli007',
  password: 'jedLa',
  database: 'joli007',
  entities: ['src/entities/*{.ts,.js}'],
  synchronize: true,
  logging: true,
};

export default dataSource_config;
