import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { Cell, toNano } from 'ton-core';
import { ArsenTon } from '../wrappers/ArsenTon';
import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';

describe('ArsenTon', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('ArsenTon');
    });

    let blockchain: Blockchain;
    let arsenTon: SandboxContract<ArsenTon>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        arsenTon = blockchain.openContract(
            ArsenTon.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await arsenTon.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: arsenTon.address,
            deploy: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and arsenTon are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await arsenTon.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await arsenTon.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: arsenTon.address,
                success: true,
            });

            const counterAfter = await arsenTon.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });
});
