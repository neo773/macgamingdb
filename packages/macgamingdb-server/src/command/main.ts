import 'reflect-metadata';
import { CommandFactory } from 'nest-commander';
import { CommandModule } from './command.module';

const bootstrap = async (): Promise<void> => {
  await CommandFactory.run(CommandModule, {
    logger: ['error', 'warn'],
  });
};

void bootstrap();
