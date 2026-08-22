-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  grade_level TEXT NOT NULL DEFAULT 'high-school',
  preferred_language TEXT NOT NULL DEFAULT 'English',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- source documents (open educational content)
CREATE TABLE public.source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  license TEXT NOT NULL DEFAULT 'CC BY 4.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || topic || ' ' || subject || ' ' || body)
  ) STORED
);
CREATE INDEX source_documents_search_idx ON public.source_documents USING GIN (search_vector);
GRANT SELECT ON public.source_documents TO anon;
GRANT SELECT ON public.source_documents TO authenticated;
GRANT ALL ON public.source_documents TO service_role;
ALTER TABLE public.source_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open library is public" ON public.source_documents FOR SELECT TO anon, authenticated USING (true);

-- conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New doubt',
  subject TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX conversations_user_idx ON public.conversations (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.conversations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages (conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER conversations_touch BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- seed open educational content
INSERT INTO public.source_documents (subject, topic, title, body, source_name, source_url) VALUES
('Mathematics','Algebra','Solving linear equations','A linear equation in one variable can be written as ax + b = 0 with a not equal to zero. To solve it, isolate the variable by applying the same operation to both sides of the equation: subtract b from both sides to get ax = -b, then divide both sides by a to get x = -b/a. Checking the solution means substituting it back into the original equation so that both sides evaluate to the same number.','OpenStax Elementary Algebra','https://openstax.org/details/books/elementary-algebra-2e'),
('Mathematics','Algebra','Factoring quadratic expressions','A quadratic expression ax^2 + bx + c can often be rewritten as a product of two binomials. When a = 1, look for two numbers whose product is c and whose sum is b. If no such integer pair exists, use the quadratic formula x = (-b +/- sqrt(b^2 - 4ac)) / (2a). The expression b^2 - 4ac is the discriminant: positive means two real roots, zero means one repeated root, negative means no real roots.','OpenStax Intermediate Algebra','https://openstax.org/details/books/intermediate-algebra-2e'),
('Mathematics','Calculus','The derivative as a rate of change','The derivative of a function f at a point x measures the instantaneous rate of change of f at that point, defined as the limit of the difference quotient (f(x + h) - f(x)) / h as h approaches zero. Geometrically it is the slope of the tangent line to the graph at x. The power rule states that the derivative of x^n is n times x^(n-1).','OpenStax Calculus Volume 1','https://openstax.org/details/books/calculus-volume-1'),
('Mathematics','Geometry','The Pythagorean theorem','In any right triangle, the square of the length of the hypotenuse equals the sum of the squares of the lengths of the other two sides: a^2 + b^2 = c^2, where c is the side opposite the right angle. The converse is also true: if the side lengths of a triangle satisfy this relation, the triangle must contain a right angle.','OpenStax Prealgebra','https://openstax.org/details/books/prealgebra-2e'),
('Mathematics','Statistics','Mean, median and mode','The mean is the sum of all values divided by the number of values, and it is sensitive to extreme values. The median is the middle value once the data are ordered, and it resists outliers. The mode is the value that occurs most often. When a distribution is skewed, the median usually describes the centre better than the mean.','OpenStax Introductory Statistics','https://openstax.org/details/books/introductory-statistics-2e'),
('Physics','Mechanics','Newton''s three laws of motion','Newton''s first law states that an object remains at rest or in uniform motion in a straight line unless acted on by a net external force. The second law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass, written as F = ma. The third law states that for every action force there is an equal and opposite reaction force acting on a different body.','OpenStax College Physics','https://openstax.org/details/books/college-physics-2e'),
('Physics','Mechanics','Work, energy and the work-energy theorem','Work is done when a force moves an object through a displacement, W = F d cos(theta), where theta is the angle between force and displacement. Kinetic energy is KE = (1/2) m v^2. The work-energy theorem states that the net work done on an object equals the change in its kinetic energy. Energy is conserved in an isolated system: it changes form but is never created or destroyed.','OpenStax College Physics','https://openstax.org/details/books/college-physics-2e'),
('Physics','Electricity','Ohm''s law and simple circuits','Ohm''s law states that the current through a conductor between two points is directly proportional to the voltage across the two points, V = IR, where R is resistance measured in ohms. In a series circuit, resistances add and the same current flows through each element. In a parallel circuit, the reciprocals of the resistances add and the voltage across each branch is the same.','OpenStax College Physics','https://openstax.org/details/books/college-physics-2e'),
('Physics','Waves','Wave speed, frequency and wavelength','A periodic wave is described by its wavelength (the distance between successive crests), its frequency (the number of cycles per second, measured in hertz), and its amplitude. These are related by v = f times lambda, where v is the wave speed in the medium. For a given medium the speed is fixed, so increasing the frequency shortens the wavelength.','OpenStax Physics','https://openstax.org/details/books/physics'),
('Chemistry','Atomic structure','Atoms, isotopes and the mole','An atom consists of protons and neutrons in a nucleus surrounded by electrons. The atomic number equals the number of protons and identifies the element; isotopes of an element differ in the number of neutrons. The mole is the amount of substance containing 6.022 x 10^23 particles, and molar mass in grams per mole equals the atomic or molecular mass in atomic mass units.','OpenStax Chemistry 2e','https://openstax.org/details/books/chemistry-2e'),
('Chemistry','Reactions','Balancing chemical equations','A balanced chemical equation has the same number of atoms of each element on both sides, because mass is conserved in a chemical reaction. Balance by adjusting stoichiometric coefficients only, never subscripts, since changing a subscript changes the substance. A useful order is to balance metals first, then non-metals, then hydrogen, then oxygen.','OpenStax Chemistry 2e','https://openstax.org/details/books/chemistry-2e'),
('Chemistry','Acids and bases','pH, acids and bases','An acid donates protons in solution while a base accepts them. The pH scale measures hydrogen ion concentration as pH = -log10[H+]; a pH below 7 is acidic, 7 is neutral, and above 7 is basic at 25 degrees Celsius. A change of one pH unit corresponds to a tenfold change in hydrogen ion concentration. In neutralisation, an acid and a base react to form a salt and water.','OpenStax Chemistry 2e','https://openstax.org/details/books/chemistry-2e'),
('Biology','Cell biology','Cell structure and organelles','All living things are made of cells. Prokaryotic cells lack a membrane-bound nucleus, while eukaryotic cells contain a nucleus and other organelles. Mitochondria carry out cellular respiration to release energy as ATP; ribosomes assemble proteins; the plasma membrane controls what enters and leaves the cell. Plant cells additionally contain chloroplasts and a cellulose cell wall.','OpenStax Biology 2e','https://openstax.org/details/books/biology-2e'),
('Biology','Energy','Photosynthesis and cellular respiration','In photosynthesis, plants use light energy to convert carbon dioxide and water into glucose and oxygen, occurring in the chloroplasts through light-dependent reactions and the Calvin cycle. Cellular respiration reverses the overall balance: glucose and oxygen are used to produce carbon dioxide, water, and ATP through glycolysis, the citric acid cycle, and oxidative phosphorylation.','OpenStax Biology 2e','https://openstax.org/details/books/biology-2e'),
('Biology','Genetics','Mendelian inheritance and Punnett squares','Genes come in alternative forms called alleles, and an organism inherits one allele from each parent. A dominant allele masks the effect of a recessive allele in a heterozygote. A Punnett square predicts offspring genotypes: crossing two heterozygotes (Aa x Aa) gives a 1:2:1 genotype ratio and a 3:1 phenotype ratio for a single trait.','OpenStax Biology 2e','https://openstax.org/details/books/biology-2e'),
('Biology','Evolution','Natural selection','Natural selection acts when individuals in a population vary in heritable traits, more offspring are produced than can survive, and some variants survive and reproduce more successfully. Over generations the frequency of advantageous alleles increases. Evidence comes from the fossil record, comparative anatomy, embryology, biogeography, and molecular sequence comparisons.','OpenStax Biology 2e','https://openstax.org/details/books/biology-2e');