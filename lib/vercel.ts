import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function deployToVercel(projectPath: string): Promise<string> {
  if (!process.env.VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN environment variable is required');
  }

  try {
    console.log(`Deploying project from: ${projectPath}`);
    
    // First, install dependencies
    console.log('Installing dependencies...');
    await execAsync('npm install', { cwd: projectPath });
    
    // Deploy to Vercel
    console.log('Deploying to Vercel...');
    const { stdout, stderr } = await execAsync(
      `vercel deploy ${projectPath} --prod --token ${process.env.VERCEL_TOKEN} --yes`,
      { timeout: 300000 } // 5 minute timeout
    );

    if (stderr) {
      console.warn('Vercel deployment warnings:', stderr);
    }

    // Extract URL from output
    const urlMatch = stdout.match(/https:\/\/[^\s]+\.vercel\.app/);
    if (!urlMatch) {
      console.error('Vercel output:', stdout);
      throw new Error('Could not extract deployment URL from Vercel output');
    }

    const deployedUrl = urlMatch[0];
    console.log(`Successfully deployed to: ${deployedUrl}`);
    
    return deployedUrl;
  } catch (error) {
    console.error('Vercel deployment error:', error);
    throw new Error(`Failed to deploy to Vercel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 