/* eslint-disable no-param-reassign */
import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    // TODO
    const transactionsRepository = getRepository(Transaction);
    const allTransactions = await transactionsRepository.find();
    const { income, outcome } = allTransactions.reduce(
      (accum, curr) => {
        if (curr.type === 'income') {
          accum.income += curr.value;
          return accum;
        }
        accum.outcome += curr.value;
        return accum;
      },
      {
        outcome: 0,
        income: 0,
      },
    );

    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
