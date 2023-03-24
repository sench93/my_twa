import { toNano } from 'ton-core';
import { ArsenTon } from '../wrappers/ArsenTon';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const arsenTon = provider.open(
        ArsenTon.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('ArsenTon')
        )
    );

    await arsenTon.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(arsenTon.address);

    console.log('ID', await arsenTon.getID());
}
