import { setupExportSelectorModal } from '@near-wallet-selector/account-export';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupNightly } from '@near-wallet-selector/nightly';
import { setupSender } from '@near-wallet-selector/sender';
import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import '@near-wallet-selector/modal-ui/styles.css';
import '@near-wallet-selector/account-export/styles.css';
import './WalletSelectorModalContext.css';
import { useDispatch } from 'react-redux';

import { showCustomAlert } from '../../../../redux/actions/status';

const ExportAccountSelectorContext =
  React.createContext(null);

const WALLET_MODULES = [
    setupMyNearWallet,
    setupMeteorWallet,
    setupSender,
    setupHereWallet,
    setupNightly,
    setupWelldoneWallet,
];

export const ExportAccountSelectorContextProvider = ({ children, network, migrationAccounts, onComplete }) => {
    const [importSelector, setSelector] = useState(null);
    const [ExportModal, setModal] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const dispatch = useDispatch();

    const init = useCallback(async () => {
        const selector = await setupWalletSelector({
            allowMultipleSelectors: true,
            network,
            modules: WALLET_MODULES.map((module) => module()),
        });
        const modal = setupExportSelectorModal(selector, {
            accounts: migrationAccounts,
            onComplete,
        });
        const state = selector.store.getState();
        setAccounts(state.accounts);

        window.importSelector = selector;
        window.ExportModal = modal;

        setSelector(selector);
        setModal(modal);
    }, []);

    useEffect(() => {
        init().catch((err) => {
            dispatch(showCustomAlert({
                errorMessage: err,
                success: false,
                messageCodeHeader: 'error'
            }));
        });
    }, [init]);

    if (!importSelector) {
        return null;
    }
    const accountId = accounts.find((account) => account.active)?.accountId || null;

    return (
        <ExportAccountSelectorContext.Provider
            value={{
                importSelector,
                ExportModal,
                accounts,
                accountId,
            }}
        >
            {children}
        </ExportAccountSelectorContext.Provider>
    );
};

export function useExportAccountSelector() {
    const context = useContext(ExportAccountSelectorContext);

    if (!context) {
        throw new Error(
            'useExportAccountSelector must be used within a ExportAccountSelectorContextProvider'
        );
    }

    return context;
}
