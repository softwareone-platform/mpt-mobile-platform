/**
 * Feature Flags E2E Test Suite
 * 
 * This test suite validates that features controlled by feature flags
 * appear or disappear appropriately based on flag configuration.
 * 
 * The tests use conditional assertions that adapt based on the current
 * flag state in the build, allowing the same test file to work with
 * any flag configuration.
 */

const { expect } = require('@wdio/globals');
const ProfilePage = require('../pageobjects/profile.page');
const headingPage = require('../pageobjects/base/heading.page');
const { ensureLoggedIn } = require('../pageobjects/utils/auth.helper');
const navigation = require('../pageobjects/utils/navigation.page');
const { TIMEOUT } = require('../pageobjects/utils/constants');
const {
    isFlagEnabled,
    skipIfFlagDisabled,
    skipIfFlagEnabled,
    assertBasedOnFlag,
    logFlagStatus,
} = require('../utils/featureFlags.util');

describe('Feature Flags E2E Tests', () => {
    
    describe('FEATURE_ACCOUNT_TABS', () => {
        const FLAG_KEY = 'FEATURE_ACCOUNT_TABS';
        
        before(async function() {
            // Log the current flag state for test visibility
            logFlagStatus(FLAG_KEY);
            
            // Ensure user is logged in
            await ensureLoggedIn();
            
            // Navigate to Profile page
            await navigation.ensureHomePage({ resetFilters: false });
            await headingPage.navAccountButton.click();
            await ProfilePage.profileHeaderTitle.waitForDisplayed({ timeout: TIMEOUT.ELEMENT_DISPLAYED });
        });
        
        after(async () => {
            // Navigate back to restore state for next test suite
            try {
                if (await ProfilePage.goBackButton.isDisplayed()) {
                    await ProfilePage.goBack();
                }
            } catch (e) {
                // Ignore navigation errors in cleanup
            }
        });
        
        it('should show account tabs component when flag is enabled', async function() {
            // Skip if flag is disabled - we test the absence in another test
            skipIfFlagDisabled.call(this, FLAG_KEY);
            
            // Verify tabs container is displayed
            await expect(ProfilePage.accountTabsContainer).toBeDisplayed();
        });
        
        it('should display All, Favourites, and Recent tabs when flag is enabled', async function() {
            skipIfFlagDisabled.call(this, FLAG_KEY);
            
            // Verify all three tabs are visible
            await expect(ProfilePage.tabAll).toBeDisplayed();
            await expect(ProfilePage.tabFavourites).toBeDisplayed();
            await expect(ProfilePage.tabRecent).toBeDisplayed();
        });
        
        it('should have All tab selected by default when flag is enabled', async function() {
            skipIfFlagDisabled.call(this, FLAG_KEY);
            
            // The All tab should be selected by default
            const allTab = await ProfilePage.tabAll;
            await expect(allTab).toBeDisplayed();
            
            // Check for selected state (accessibility trait or visual indicator)
            const isSelected = await ProfilePage.isTabSelected('all');
            expect(isSelected).toBe(true);
        });
        
        it('should allow switching between tabs when flag is enabled', async function() {
            skipIfFlagDisabled.call(this, FLAG_KEY);
            
            // Click Favourites tab
            await ProfilePage.tabFavourites.click();
            await browser.waitUntil(
                async () => await ProfilePage.isTabSelected('favourites'),
                { timeout: 5000, timeoutMsg: 'Favourites tab did not become selected' }
            );
            
            // Verify Favourites is now selected
            const isFavSelected = await ProfilePage.isTabSelected('favourites');
            expect(isFavSelected).toBe(true);
            
            // Click Recent tab
            await ProfilePage.tabRecent.click();
            await browser.waitUntil(
                async () => await ProfilePage.isTabSelected('recent'),
                { timeout: 5000, timeoutMsg: 'Recent tab did not become selected' }
            );
            
            // Verify Recent is now selected
            const isRecentSelected = await ProfilePage.isTabSelected('recent');
            expect(isRecentSelected).toBe(true);
            
            // Click back to All tab
            await ProfilePage.tabAll.click();
            await browser.waitUntil(
                async () => await ProfilePage.isTabSelected('all'),
                { timeout: 5000, timeoutMsg: 'All tab did not become selected' }
            );
            
            // Verify All is selected again
            const isAllSelected = await ProfilePage.isTabSelected('all');
            expect(isAllSelected).toBe(true);
        });
        
        it('should NOT show account tabs when flag is disabled', async function() {
            // This test only runs when the flag is disabled
            skipIfFlagEnabled.call(this, FLAG_KEY);
            
            // Verify tabs container is NOT displayed
            const tabsDisplayed = await ProfilePage.accountTabsContainer.isDisplayed().catch(() => false);
            expect(tabsDisplayed).toBe(false);
        });
        
        it('should correctly show/hide tabs based on flag state (conditional)', async function() {
            // This test adapts to whatever flag state is present
            await assertBasedOnFlag(FLAG_KEY,
                async () => {
                    // Flag enabled: tabs should be visible
                    console.info('      → Asserting tabs ARE visible (flag enabled)');
                    await expect(ProfilePage.accountTabsContainer).toBeDisplayed();
                    await expect(ProfilePage.tabAll).toBeDisplayed();
                },
                async () => {
                    // Flag disabled: tabs should NOT be visible
                    console.info('      → Asserting tabs are NOT visible (flag disabled)');
                    const tabsDisplayed = await ProfilePage.accountTabsContainer.isDisplayed().catch(() => false);
                    expect(tabsDisplayed).toBe(false);
                }
            );
        });
    });
    
    // =========================================================================
    // Template for Future Feature Flags
    // =========================================================================
    // Copy this template when adding tests for new feature flags
    // =========================================================================
    
    describe.skip('FEATURE_EXAMPLE (Template)', () => {
        const FLAG_KEY = 'FEATURE_EXAMPLE';
        
        before(async function() {
            logFlagStatus(FLAG_KEY);
            await ensureLoggedIn();
            // Navigate to feature location
        });
        
        it('should show feature when flag is enabled', async function() {
            skipIfFlagDisabled.call(this, FLAG_KEY);
            
            // Navigate to feature location
            // Assert feature is visible
            // await expect(SomePage.featureElement).toBeDisplayed();
        });
        
        it('should hide feature when flag is disabled', async function() {
            skipIfFlagEnabled.call(this, FLAG_KEY);
            
            // Navigate to feature location
            // Assert feature is NOT visible
            // const isDisplayed = await SomePage.featureElement.isDisplayed().catch(() => false);
            // expect(isDisplayed).toBe(false);
        });
        
        it('should conditionally validate feature based on flag', async function() {
            await assertBasedOnFlag(FLAG_KEY,
                async () => {
                    // Feature should be visible
                },
                async () => {
                    // Feature should be hidden
                }
            );
        });
    });
});
