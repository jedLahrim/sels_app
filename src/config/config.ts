import { DataSource, DataSourceOptions } from 'typeorm';

const dataSource_config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 8884,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  entities: ['src/entities/*{.ts,.js}'],
  synchronize: true,
  logging: true,
};

export default dataSource_config;
