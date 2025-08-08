#!/usr/bin/env node
// Frontend Debugging Agent - Artifact Analyzer
// Analyzes test artifacts and generates actionable insights

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Frontend Debugging Agent - Artifact Analysis');
console.log('===============================================');

const artifactsDir = 'artifacts';

if (!existsSync(artifactsDir)) {
    console.log('❌ No artifacts directory found. Run tests first.');
    process.exit(1);
}

// Analyze screenshots
console.log('\n📸 Screenshot Analysis');
console.log('=====================');

const screenshots = readdirSync(artifactsDir)
    .filter(file => file.endsWith('.png'))
    .sort();

if (screenshots.length === 0) {
    console.log('⚠️ No screenshots found');
} else {
    console.log(`✅ Found ${screenshots.length} screenshots:`);
    
    screenshots.forEach(screenshot => {
        const path = join(artifactsDir, screenshot);
        const stats = require('fs').statSync(path);
        const sizeKB = Math.round(stats.size / 1024);
        
        // Analyze screenshot name for insights
        let status = '📷';
        let insight = '';
        
        if (screenshot.includes('homepage')) {
            status = '🏠';
            insight = 'Homepage loaded';
        } else if (screenshot.includes('login')) {
            status = '🔐';
            insight = 'Login page accessed';
        } else if (screenshot.includes('dashboard')) {
            status = '📊';
            insight = 'Dashboard reached - LOGIN SUCCESS!';
        } else if (screenshot.includes('error')) {
            status = '❌';
            insight = 'Error state captured';
        } else if (screenshot.includes('form-filled')) {
            status = '📝';
            insight = 'Form filled successfully';
        }
        
        console.log(`   ${status} ${screenshot} (${sizeKB}KB) - ${insight}`);
    });
}

// Analyze HAR file
console.log('\n🌐 Network Analysis');
console.log('==================');

const harFiles = readdirSync(artifactsDir)
    .filter(file => file.endsWith('.har'));

if (harFiles.length === 0) {
    console.log('⚠️ No HAR files found');
} else {
    harFiles.forEach(harFile => {
        try {
            const harPath = join(artifactsDir, harFile);
            const harData = JSON.parse(readFileSync(harPath, 'utf8'));
            const entries = harData.log.entries;
            
            console.log(`✅ Analyzing ${harFile}:`);
            console.log(`   📊 Total requests: ${entries.length}`);
            
            // Analyze HTTP status codes
            const statusCodes = {};
            const failedRequests = [];
            const slowRequests = [];
            
            entries.forEach(entry => {
                const status = entry.response.status;
                const url = entry.request.url;
                const time = entry.time;
                
                statusCodes[status] = (statusCodes[status] || 0) + 1;
                
                if (status >= 400) {
                    failedRequests.push({ url, status, time });
                }
                
                if (time > 2000) {
                    slowRequests.push({ url, time: Math.round(time) });
                }
            });
            
            // Report status codes
            console.log('   📈 Status codes:');
            Object.entries(statusCodes)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .forEach(([status, count]) => {
                    const emoji = status.startsWith('2') ? '✅' : 
                                 status.startsWith('3') ? '🔄' : 
                                 status.startsWith('4') ? '⚠️' : '❌';
                    console.log(`      ${emoji} ${status}: ${count} requests`);
                });
            
            // Report failed requests
            if (failedRequests.length > 0) {
                console.log('   ❌ Failed requests:');
                failedRequests.slice(0, 5).forEach(req => {
                    console.log(`      ${req.status} ${req.url}`);
                });
                if (failedRequests.length > 5) {
                    console.log(`      ... and ${failedRequests.length - 5} more`);
                }
            }
            
            // Report slow requests
            if (slowRequests.length > 0) {
                console.log('   🐌 Slow requests (>2s):');
                slowRequests.slice(0, 5).forEach(req => {
                    console.log(`      ${req.time}ms ${req.url}`);
                });
                if (slowRequests.length > 5) {
                    console.log(`      ... and ${slowRequests.length - 5} more`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Error analyzing ${harFile}: ${error.message}`);
        }
    });
}

// Analyze Playwright trace
console.log('\n🎭 Playwright Trace Analysis');
console.log('============================');

const traceFiles = readdirSync(artifactsDir)
    .filter(file => file.endsWith('.zip') && file.includes('trace'));

if (traceFiles.length === 0) {
    console.log('⚠️ No trace files found');
} else {
    console.log(`✅ Found ${traceFiles.length} trace file(s):`);
    traceFiles.forEach(trace => {
        const path = join(artifactsDir, trace);
        const stats = require('fs').statSync(path);
        const sizeMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
        
        console.log(`   🎬 ${trace} (${sizeMB}MB)`);
        console.log(`      View with: npx playwright show-trace ${path}`);
    });
}

// Analyze test results
console.log('\n📊 Test Results Analysis');
console.log('========================');

const testResultFiles = readdirSync(artifactsDir)
    .filter(file => file.includes('test-results') && file.endsWith('.json'));

if (testResultFiles.length === 0) {
    console.log('⚠️ No test result files found');
} else {
    testResultFiles.forEach(resultFile => {
        try {
            const resultsPath = join(artifactsDir, resultFile);
            const results = JSON.parse(readFileSync(resultsPath, 'utf8'));
            
            console.log(`✅ Analyzing ${resultFile}:`);
            
            if (results.suites) {
                results.suites.forEach(suite => {
                    console.log(`   📁 Suite: ${suite.title}`);
                    
                    if (suite.specs) {
                        suite.specs.forEach(spec => {
                            const status = spec.ok ? '✅' : '❌';
                            console.log(`      ${status} ${spec.title}`);
                            
                            if (spec.tests) {
                                spec.tests.forEach(test => {
                                    const testStatus = test.status === 'passed' ? '✅' : 
                                                     test.status === 'failed' ? '❌' : '⚠️';
                                    console.log(`         ${testStatus} ${test.status} (${test.duration}ms)`);
                                    
                                    if (test.errors && test.errors.length > 0) {
                                        test.errors.forEach(error => {
                                            console.log(`            💥 ${error.message}`);
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
            
        } catch (error) {
            console.log(`❌ Error analyzing ${resultFile}: ${error.message}`);
        }
    });
}

// Generate summary and recommendations
console.log('\n🎯 Summary & Recommendations');
console.log('============================');

const hasSuccessScreenshot = screenshots.some(s => s.includes('dashboard') || s.includes('success'));
const hasErrorScreenshot = screenshots.some(s => s.includes('error'));
const hasTraceFile = traceFiles.length > 0;

if (hasSuccessScreenshot) {
    console.log('✅ LOGIN FLOW SUCCESS: Dashboard screenshot found');
    console.log('   🎉 Your login flow is working correctly!');
} else if (hasErrorScreenshot) {
    console.log('❌ LOGIN FLOW FAILED: Error screenshot found');
    console.log('   🔧 Check the error screenshot and trace for debugging');
} else {
    console.log('⚠️ LOGIN FLOW STATUS UNCLEAR');
    console.log('   📸 Review screenshots to determine what happened');
}

console.log('\n📋 Next Steps:');

if (hasTraceFile) {
    console.log('1. 🎬 View detailed trace:');
    traceFiles.forEach(trace => {
        console.log(`   npx playwright show-trace artifacts/${trace}`);
    });
}

if (screenshots.length > 0) {
    console.log('2. 📸 Review screenshots:');
    console.log('   Open artifacts/*.png files to see visual flow');
}

if (harFiles.length > 0) {
    console.log('3. 🌐 Analyze network traffic:');
    console.log('   Import artifacts/*.har into browser dev tools');
}

console.log('4. 🔄 Re-run tests after fixes:');
console.log('   ./scripts/run-debug-tests.sh');

console.log('\n🎉 Analysis Complete!');
console.log('====================');